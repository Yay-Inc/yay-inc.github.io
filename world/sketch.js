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

let x = 0;
let y = 0;
let z = 0;
let youSize = 50;
let speedX = 0;
let speedY = 0;
let speedZ = 0;

let cam;
let sensitivity = 1;
const RENDIS = 20000;
let fov = 75;

let world;
const TERRAINHEIGHT = 3000;
const TERRAINRES = 1000;

class World {
  constructor(size) {
    // Generate terrain
    this.terrain = [];

    for (let i = 0; i < RENDIS * 2; i += TERRAINRES) {
      let row = [];
      for (let j = 0; j < RENDIS * 2; j += TERRAINRES) {
        row.push(noise(i * 0.001, j * 0.001) * TERRAINHEIGHT);
      }
      this.terrain.push(row);
    }

    
    // Setup trees
    this.trees = [];
    let num = Math.floor(random(RENDIS / 200, RENDIS / 50));
    
    // Add trees with random dimensions
    for (let i = 0; i < num; i++) {
      let tree = {};
      tree.treeHeight = random(100, 500);
      
      tree.treeWidth = random(tree.treeHeight / 5, tree.treeHeight / 1.5);
      tree.x = random(-RENDIS / 10, RENDIS / 10) * 10;
      tree.z = random(-RENDIS / 10, RENDIS / 10) * 10;
      
      this.trees.push(tree);
    }
  }
}

async function setup() {
  // Load ground and sky images
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  skies.push(await loadImage("assets/sky2.jpg"));
  skies.push(await loadImage("assets/sky5.jpg"));
  skies.push(await loadImage("assets/sky9.jpg"));
  skies.push(await loadImage("assets/sky16.jpg"));
  
  canvas = createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // Generate world
  world = new World(RENDIS);
}

function draw() {
  // Check if paused
  if (!paused) {
    lights();
    strokeMode(SIMPLE);
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
  else if (key === "i" && fov < 120) {
    fov += 5;
    console.log("FOV: " + fov);
  }

  // Decrease FOV
  else if (key === "k" && fov > 25) {
    fov -= 5;
    console.log("FOV: " + fov);
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
      cam.setPosition(x, y - youSize, z);
      cam.perspective(fov, width / height, 0.01, RENDIS * 2);
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
  // Forward and Back
  if (keyIsDown("w") || keyIsDown("W") || keyIsDown(UP_ARROW)) {
    // Sprint
    if (keyIsDown(SHIFT)) {
      speedZ = -20;
    }
    // Walk
    else {
      speedZ = -10;
    }
  }
  else if (keyIsDown("s") || keyIsDown("S") || keyIsDown(DOWN_ARROW)) {
    speedZ = 10;
  }
  else {
    // Deceleration
    if (speedZ !== 0) {
      speedZ -= speedZ / Math.abs(speedZ);
    }
  }

  // Strafe
  if (keyIsDown("a") || keyIsDown("A") || keyIsDown(LEFT_ARROW)) {
    speedX = -8;
  }
  else if (keyIsDown("d") || keyIsDown("D") || keyIsDown(RIGHT_ARROW)) {
    speedX = 8;
  }
  else {
    // Deceleration
    if (speedX !== 0) {
      speedX -= speedX / Math.abs(speedX);
    }
  }
  
  // Jump
  if (keyIsDown(" ") && y === 0) {
    speedY = -20;
  }

  // Difference between cam and where it's pointing
  let dif = createVector(cam.eyeX - cam.centerX, cam.eyeZ - cam.centerZ);
  
  // Gets rotated movement vector
  let rotated = createVector(speedX, speedZ);
  rotated.rotate(dif.heading() - 90);

  x += rotated.x;
  y += speedY;
  z += rotated.y;

  // Essentially gravity
  if (y !== 0) {
    speedY += 1;
  }
  else {
    speedY = 0;
  }
}

function updateCam() {
  cam.setPosition(x, y - youSize, z);
  
  // Rotate camera based on mouse movements
  cam.pan(-movedX / 4 * sensitivity);
  if (cam.centerY < 795 + y - youSize && movedY > 0 || cam.centerY > -795 + y - youSize && movedY < 0) {
    cam.tilt(movedY / 4 * sensitivity);
  }

  // Update perspective
  cam.perspective(fov, width / height, 0.01, RENDIS * 2);

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

  beginShape(POINTS);

  for (let i = 0; i < world.terrain.length; i++) {
    for (let j = 0; j < world.terrain[i].length; j++) {
      vertex(i * TERRAINRES - RENDIS, world.terrain[i][j] - TERRAINHEIGHT / 2, j * TERRAINRES - RENDIS);
      // console.log(world.terrain[i][j]);
    }
  }

  endShape();

  // rotateX(90);
  // plane(RENDIS * 2);
  pop();

  // Draw trees
  for (let i = 0; i < world.trees.length; i++) {
    let tree = world.trees[i];
    
    // Trunk
    push();
    noStroke();
    translate(tree.x, -tree.treeHeight / 2, tree.z);
    fill(80, 50, 10);
    cylinder(tree.treeHeight / 10, tree.treeHeight);

    // Leaves
    translate(0, -tree.treeHeight / 2 - 5, 0);
    fill(40, 100, 40);
    cone(tree.treeWidth, -tree.treeHeight);
    pop();
  }
}