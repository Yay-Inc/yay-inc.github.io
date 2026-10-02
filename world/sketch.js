// 3D World
// Asher Waldschmidt
// 10/2/2026
//
// Extra for Experts:
// - Worked in 3D with WEBGL canvas
// - Used classes, arrays, and vectors

// Where I got sky equirectangular photos: https://www.philohome.com/skycollec/skycollec.htm

let graphics;
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

class World {
  constructor(size) {
    // Setup trees
    this.trees = [];
    let num = Math.floor(random(RENDIS / 200, RENDIS / 50));
    
    // Add trees with random dimensions
    for (let i = 0; i < num; i++) {
      let tree = new Map();
      let treeHeight = random(100, 500);
      
      tree.set("treeHeight", treeHeight);
      tree.set("treeWidth", random(treeHeight / 5, treeHeight / 1.5));
      tree.set("x", random(-RENDIS / 10, RENDIS / 10) * 10);
      tree.set("z", random(-RENDIS / 10, RENDIS / 10) * 10);
      
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
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  graphics = createGraphics(windowWidth, windowHeight);
  angleMode(DEGREES);

  // Create camera
  cam = createCamera();
  cam.setPosition(x, y - youSize, z);
  cam.perspective(fov, width / height, 0.01, RENDIS * 2);

  // Generate world
  world = new World(RENDIS);
}

function draw() {
  resizeCanvas(windowWidth, windowHeight);
  graphics.resizeCanvas(windowWidth, windowHeight);
  
  lights();
  strokeMode(SIMPLE);

  // Check if paused
  if (!paused) {
    checkMoveInput();
    updateCam();
  }
  else {
    pauseScreen();
  }

  scene();
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

  // Pause (doesn't really work because browser takes escape input to exit 
  //        pointer lock so you have to press escape twice for this code to run)
  else if (key === "Escape" && !paused) {
    paused = true;
    exitPointerLock();
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
    paused = false;
    requestPointerLock();
  }
  else {
    paused = true;
    exitPointerLock();
  }
}

function checkMoveInput() {
  // Forward and Back
  if (keyIsDown("w") || keyIsDown(UP_ARROW)) {
    // Sprint
    if (keyIsDown(SHIFT)) {
      speedZ = -20;
    }
    // Walk
    else {
      speedZ = -10;
    }
  }
  else if (keyIsDown("s") || keyIsDown(DOWN_ARROW)) {
    speedZ = 10;
  }
  else {
    // Deceleration
    if (speedZ !== 0) {
      speedZ -= speedZ / Math.abs(speedZ);
    }
  }

  // Strafe
  if (keyIsDown("a") || keyIsDown(LEFT_ARROW)) {
    speedX = -8;
  }
  else if (keyIsDown("d") || keyIsDown(RIGHT_ARROW)) {
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
  graphics.circle(windowWidth / 2, windowHeight / 2, 50);
  
  push();
  noStroke();
  texture(graphics);
  
  cam.lookAt(0, 0, 0);

  translate(cam.eyeX, cam.eyeY, cam.eyeZ);
  plane(windowWidth, windowHeight);
  pop();
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
  rotateX(90);
  plane(RENDIS * 2);
  pop();

  // Draw trees
  for (let i = 0; i < world.trees.length; i++) {
    let tree = world.trees[i];
    
    // Trunk
    push();
    noStroke();
    translate(tree.get("x"), -tree.get("treeHeight") / 2, tree.get("z"));
    fill(80, 50, 10);
    cylinder(tree.get("treeHeight") / 10, tree.get("treeHeight"));

    // Leaves
    translate(0, -tree.get("treeHeight") / 2 - 5, 0);
    fill(40, 100, 40);
    cone(tree.get("treeWidth"), -tree.get("treeHeight"));
    pop();
  }
}