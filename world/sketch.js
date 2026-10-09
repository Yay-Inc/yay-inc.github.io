// 3D World
// Asher Waldschmidt
// 10/2/2026
//
// Extra for Experts:
// - Worked in 3D with WEBGL canvas
// - Used classes, arrays, and vectors

// Where I got sky equirectangular photos: https://www.philohome.com/skycollec/skycollec.htm

let canvas;
let dirtImg;
let skies = [];
let skyNum = 0;

let paused = true;

// let x = 0;
// let y = 0;
// let z = 0;
let youSize = 50;
let speedX = 0;
let speedY = 0;
let speedZ = 0;

let cam;
let sensitivity = 1;
const RENDIS = 20000;
let shared;

let world;
const SEED = 1;
const TERRAINHEIGHT = 2000;
const TERRAINRES = 200;
const MOD = 0.0002;

class World {
  constructor(size) {
    // Generate terrain
    let terrain = new p5.Geometry();
    const side = size * 2 / TERRAINRES;

    // Get vertices from noise
    for (let i = 0; i < size * 2; i += TERRAINRES) {
      for (let j = 0; j < size * 2; j += TERRAINRES) {
        terrain.vertices.push(createVector(i - size, noise(i * MOD, j * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2, j - size));
      }
    }

    // Stitch faces together
    for (let i = 0; i < side - 1; i++) {
      for (let j = 0; j < side - 1; j++) {
        terrain.faces.push([i * side + j, 
          i * side + j + 1, 
          i * side + j + side]);
        terrain.faces.push([i * side + j + 1 + side, 
          i * side + j + 1, 
          i * side + j + side]);
      }
    }

    //terrain.makeEdgesFromFaces();
    terrain.computeNormals();

    this.terrain = terrain;
    
    // Setup trees
    this.trees = [];
    let num = Math.floor(random(size / 200, size / 50));
    
    // Add trees with random dimensions
    for (let i = 0; i < num; i++) {
      let tree = {};
      tree.treeHeight = random(300, 1000);
      
      tree.treeWidth = random(tree.treeHeight / 5, tree.treeHeight / 1.5);
      tree.x = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      tree.z = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      tree.y = noise((tree.x + size) * MOD, (tree.z + size) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;//this.terrain.vertices[(tree.x + size) / TERRAINRES * side + (tree.z + size) / TERRAINRES].y;
      
      this.trees.push(tree);
    }
  }
}

async function setup() {
  // connect to a p5party server
  partyConnect(
    "wss://demoserver.p5party.org",
    "world"
  );
  
  // tell p5.party to sync the pos object
  shared = partyLoadShared("shared", { fov: 75, x: 0, y: 100, z: 0 });

  if (partyIsHost()) {
		shared.fov = 75;
    console.log("I'm HOST");
	}
  
  // Load ground and sky images
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  skies.push(await loadImage("assets/sky2.jpg"));
  skies.push(await loadImage("assets/sky5.jpg"));
  skies.push(await loadImage("assets/sky9.jpg"));
  skies.push(await loadImage("assets/sky16.jpg"));
  
  canvas = createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  noiseSeed(SEED);

  // Generate world
  world = new World(RENDIS);
}

function draw() {
  // Check if paused
  if (!paused) {
    lights();
    checkMoveInput();
    updateCam();
    scene();
  }
  else {
    pauseScreen();
  }
}

function keyPressed() {  
  // Switch sky
  if (key === "b") {
    if (skyNum < skies.length - 1) {
      skyNum++;
    }
    else {
      skyNum = 0;
    }
  }

  // Pause
  else if (key === "e") {
    doubleClicked();
  }

  // Increase FOV
  else if (key === "i" && shared.fov < 120) {
    shared.fov += 5;
    console.log("FOV: " + shared.fov);
  }

  // Decrease FOV
  else if (key === "k" && shared.fov > 25) {
    shared.fov -= 5;
    console.log("FOV: " + shared.fov);
  }
}

function doubleClicked() {
  // Browsers require a mouse input to lock pointer
  if (paused) {
    canvas.remove();
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);

    // Create camera only first time
    if (cam === undefined) {
      cam = createCamera();
      cam.setPosition(shared.x, shared.y - youSize, shared.z);
      cam.perspective(shared.fov, width / height, 0.01, RENDIS * 2);
    }

    paused = false;
    requestPointerLock();
  }
  else {
    canvas.remove();
    canvas = createCanvas(windowWidth, windowHeight);
    
    paused = true;
    exitPointerLock();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkMoveInput() {
  const ground = noise((shared.x + RENDIS) * MOD, (shared.z + RENDIS) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
  
  // Forward and Back
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    // Sprint
    if (keyIsDown(88)) {
      speedZ = -20;
    }
    // Walk
    else {
      speedZ = -10;
    }
  }
  else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    speedZ = 10;
  }
  else {
    // Deceleration
    if (speedZ !== 0) {
      speedZ -= speedZ / Math.abs(speedZ);
    }
  }

  // Strafe
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    speedX = -8;
  }
  else if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    speedX = 8;
  }
  else {
    // Deceleration
    if (speedX !== 0) {
      speedX -= speedX / Math.abs(speedX);
    }
  }
  
  // Jump
  if (keyIsDown(32) && shared.y >= ground - 20) {
    speedY = -20;
  }

  // Difference between cam and where it's pointing
  let dif = createVector(cam.eyeX - cam.centerX, cam.eyeZ - cam.centerZ);
  
  // Gets rotated movement vector
  let rotated = createVector(speedX, speedZ);
  rotated.rotate(dif.heading() - 90);

  shared.x += rotated.x;
  shared.y += speedY;
  shared.z += rotated.y;

  // Essentially gravity
  if (shared.y < ground) {
    speedY += 1;
  }
  else {
    speedY = 0;
    shared.y = ground;
  }
}

function updateCam() {
  cam.setPosition(shared.x, shared.y - youSize, shared.z);
  
  // Rotate camera based on mouse movements
  cam.pan(-movedX / 4 * sensitivity);
  if (cam.centerY < 795 + shared.y - youSize && movedY > 0 || cam.centerY > -795 + shared.y - youSize && movedY < 0) {
    cam.tilt(movedY / 4 * sensitivity);
  }

  // Update perspective
  cam.perspective(shared.fov, width / height, 0.01, RENDIS * 2);

  setCamera(cam);
}

function pauseScreen() {
  background(150);
  textAlign(CENTER);
  textSize(60);
  text("PAUSED", windowWidth / 2, windowHeight / 3);

  textSize(30);
  text("Controls:", windowWidth / 2, windowHeight / 3 + 50);

  textSize(20);
  text("E/Double click = Pause/Resume\nMouse = Look around\nWASD/Arrow keys = Movement\nSpace bar = Jump\nShift key = Sprint\nB = Cycle sky\nI/K = Raise/Lower FOV", 
    windowWidth / 2, windowHeight / 3 + 100);
}

function scene() {
  background(220);
  
  // Draw the sky
  push();
  noStroke();
  texture(skies[skyNum]);
  sphere(RENDIS);
  pop();
  
  // Draw the ground
  push();
  noStroke();
  texture(dirtImg);

  model(world.terrain);

  // rotateX(90);
  // plane(RENDIS * 2);
  pop();

  // Draw trees
  for (let i = 0; i < world.trees.length; i++) {
    let tree = world.trees[i];
    
    // Trunk
    push();
    noStroke();
    translate(tree.x, tree.y - tree.treeHeight / 2 + 20, tree.z);
    fill(80, 50, 10);
    cylinder(tree.treeHeight / 10, tree.treeHeight);

    // Leaves
    translate(0, -tree.treeHeight / 2 - 5, 0);
    fill(40, 100, 40);
    cone(tree.treeWidth, -tree.treeHeight);
    pop();
  }
}