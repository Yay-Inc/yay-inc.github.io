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
let font;

let paused = true;

let my = { x: 0, y: 0, z: 0, fov: 75 };
let youSize = 50;
let speedX = 0;
let speedY = 0;
let speedZ = 0;

let cam;
let sensitivity = 1;
const RENDIS = 20000;
let guests;
let shared;

let world;
const SEED = 2;
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
      tree.y = noise((tree.x + size) * MOD, (tree.z + size) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
      
      this.trees.push(tree);
    }
  }
}

function preload() {
  // connect to a p5party server
  partyConnect(
    "wss://demoserver.p5party.org",
    "world"
  );
  
  shared = partyLoadShared("shared", { seed: SEED, trees: [] });
  my = partyLoadMyShared(my);
  guests = partyLoadGuestShareds();
  
}

async function setup() {
  // Load ground and sky images
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  skies.push(await loadImage("assets/sky2.jpg"));
  skies.push(await loadImage("assets/sky5.jpg"));
  skies.push(await loadImage("assets/sky9.jpg"));
  skies.push(await loadImage("assets/sky16.jpg"));

  font = await loadFont("assets/Genjibold.otf");
  
  canvas = createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  noiseSeed(SEED);

  // Generate world
  world = new World(RENDIS);
  if (partyIsHost()) {
    shared.trees = world.trees;
  }
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
  else if (key === "i" && my.fov < 120) {
    my.fov += 5;
    console.log("FOV: " + my.fov);
  }

  // Decrease FOV
  else if (key === "k" && my.fov > 25) {
    my.fov -= 5;
    console.log("FOV: " + my.fov);
  }
}

function doubleClicked() {
  // Browsers require a mouse input to lock pointer
  if (paused) {
    canvas.remove();
    canvas = undefined;
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);

    // Create camera only first time
    if (cam === undefined) {
      cam = createCamera();
      cam.setPosition(my.x, my.y - youSize, my.z);
      cam.perspective(my.fov, width / height, 5, RENDIS * 2);
    }

    paused = false;
    requestPointerLock();
  }
  else {
    canvas.remove();
    canvas = undefined;
    canvas = createCanvas(windowWidth, windowHeight);
    
    paused = true;
    exitPointerLock();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkMoveInput() {
  const ground = noise((my.x + RENDIS) * MOD, (my.z + RENDIS) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
  
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
  if (keyIsDown(32) && my.y >= ground - 20) {
    speedY = -20;
  }

  // Difference between cam and where it's pointing
  let dif = createVector(cam.eyeX - cam.centerX, cam.eyeZ - cam.centerZ);
  
  // Gets rotated movement vector
  let rotated = createVector(speedX, speedZ);
  rotated.rotate(dif.heading() - 90);

  my.x += rotated.x;
  my.y += speedY;
  my.z += rotated.y;

  // Essentially gravity
  if (my.y < ground) {
    speedY += 1;
  }
  else {
    speedY = 0;
    my.y = ground;
  }
}

function updateCam() {
  cam.setPosition(my.x, my.y - youSize, my.z);
  
  // Rotate camera based on mouse movements
  cam.pan(-movedX / 4 * sensitivity);
  if (cam.centerY < 795 + my.y - youSize && movedY > 0 || cam.centerY > -795 + my.y - youSize && movedY < 0) {
    cam.tilt(movedY / 4 * sensitivity);
  }

  // Update perspective
  cam.perspective(my.fov, width / height, 30, RENDIS * 2);

  setCamera(cam);
}

function pauseScreen() {
  background(150);
  textAlign(CENTER);
  textSize(60);
  textFont(font);
  fill(255);
  text("PAUSED", windowWidth / 2, windowHeight / 3);

  textSize(30);
  text("Controls:", windowWidth / 2, windowHeight / 3 + 50);

  textSize(20);
  text("E/Double click = Pause/Resume\nMouse = Look around\nWASD/Arrow keys = Movement\nSpace bar = Jump\nX = Sprint\nB = Cycle sky\nI/K = Raise/Lower FOV", 
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
  pop();

  // Draw trees
  for (let i = 0; i < shared.trees.length; i++) {
    let tree = shared.trees[i];
    
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

  // Draw people
  // console.log(guests);

  for (const guest of guests) {
    push()
    noStroke();
    translate(guest.x, guest.y - youSize / 2, guest.z);
    fill("orange");
    cylinder(youSize / 4, youSize);
    pop();
  }
}