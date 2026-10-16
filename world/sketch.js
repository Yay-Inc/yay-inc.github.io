// 3D World
// Asher Waldschmidt
// 10/2/2026
//
// Extra for Experts:
// - Worked in 3D with WEBGL canvas
// - Used classes, arrays, and vectors

// Where I got sky equirectangular photos: https://www.philohome.com/skycollec/skycollec.htm

const COMMONWEBCOLORS = [
  "black",
  "white",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "gray",
  "silver",
  "cyan",
  "magenta",
  "brown",
  "navy",
  "teal",
  "maroon",
  "olive",
  "coral",
  "gold"
];

let canvas;
let dirtImg;
let skies = [];
let skyNum = 0;
let font;

let paused = true;

let my = { x: 0, y: 0, z: 0, fov: 75, pan: 90, tilt: 0, color: "black" };
const YOUSIZE = 100;
let speedX = 0;
let speedY = 0;
let speedZ = 0;

let cam;
let camMode = 0;
let sensitivity = 1;
const RENDIS = 20000;
let guests;
let shared;

let world;
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
  
  shared = partyLoadShared("shared", { seed: 0, trees: [] });
  my = partyLoadMyShared(my);
  guests = partyLoadGuestShareds();

  // Load ground and sky images
  dirtImg = loadImage("assets/dirt-texture.jpg");
  skies.push(loadImage("assets/sky2.jpg"));
  skies.push(loadImage("assets/sky5.jpg"));
  skies.push(loadImage("assets/sky9.jpg"));
  skies.push(loadImage("assets/sky16.jpg"));

  font = loadFont("assets/Genjibold.otf");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);

  if (shared.seed === 0) {
    shared.seed = Math.floor(random(1, 100));
  }
  noiseSeed(shared.seed);

  // Generate world
  world = new World(RENDIS);
  if (partyIsHost()) {
    shared.trees = world.trees;
  }

  my.color = COMMONWEBCOLORS[Math.floor(Math.random() * COMMONWEBCOLORS.length)];
  
  cam2 = createCamera();
  cam = createCamera();
  cam.setPosition(my.x, my.y - YOUSIZE, my.z);
  cam.perspective(my.fov, width / height, 5, RENDIS * 2);

  
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
  if (key.toLowerCase() === "b") {
    if (skyNum < skies.length - 1) {
      skyNum++;
    }
    else {
      skyNum = 0;
    }
  }

  // Pause
  else if (key.toLowerCase() === "e") {
    doubleClicked();
  }

  // Switch camera
  else if (key.toLowerCase() === "r") {
    if (camMode !== 2) {
      camMode++;
    }
    else {
      camMode = 0;
    }
  }

  // Increase FOV
  else if (key.toLowerCase() === "i" && my.fov < 120) {
    my.fov += 5;
    console.log("FOV: " + my.fov);
  }

  // Decrease FOV
  else if (key.toLowerCase() === "k" && my.fov > 25) {
    my.fov -= 5;
    console.log("FOV: " + my.fov);
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkMoveInput() {
  const ground = noise((my.x + RENDIS) * MOD, (my.z + RENDIS) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
  
  let accelX = -2 * Math.abs(speedX) / speedX;
  let accelZ = -2 * Math.abs(speedZ) / speedZ;

  // Forward and Back
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    // Sprint
    if (keyIsDown(16)) {
      accelZ = -20;
    }
    // Walk
    else {
      accelZ = -10;
    }
  }
  else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    accelZ = 10;
  }

  // Strafe
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    accelX = -8;
  }
  else if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    accelX = 8;
  }
  
  // Jump
  if (keyIsDown(32) && my.y >= ground - 20) {
    speedY = -20;
  }

  // Gets rotated movement vector
  let rotated = createVector(accelX, accelZ);
  rotated.rotate(my.pan - 90);

  if (Math.abs(speedX + rotated.x) <= 20) {
    speedX += rotated.x;
  }
  
  if (Math.abs(speedZ + rotated.y) <= 20) {
    speedZ += rotated.y;
  }

  my.x += speedX;
  my.y += speedY;
  my.z += speedZ;

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
  cam.setPosition(my.x, my.y - YOUSIZE, my.z);
  
  // Rotate camera based on mouse movements
  cam.pan(-movedX / 4 * sensitivity);
  if (cam.centerY < 795 + my.y - YOUSIZE && movedY > 0 || cam.centerY > -795 + my.y - YOUSIZE && movedY < 0) {
    cam.tilt(movedY / 4 * sensitivity);
  }

  // found this math here: https://editor.p5js.org/rjgilmour/sketches/DKDWmmvrm
  my.pan = atan2(cam.eyeZ - cam.centerZ, cam.eyeX - cam.centerX);
  my.tilt = atan2(cam.eyeY - cam.centerY, dist(cam.centerX, cam.centerZ, cam.eyeX, cam.eyeZ));

  // Update perspective
  cam.perspective(my.fov, width / height, YOUSIZE / 2, RENDIS * 2);

  if (camMode === 1) {
    cam.move(0, 0, YOUSIZE * 2.5);
    setCamera(cam);
  }
  else if (camMode === 2) {
    let cam2 = createCamera();
    cam2.set(cam);
    cam2.pan(180);
    cam2.move(0, 0, YOUSIZE * 2.5);
    setCamera(cam2);
  }
  else {
    setCamera(cam);
  }
  
}

function pauseScreen() {
  cam.perspective(60, width / height, 1, 1000);
  setCamera(cam);
  
  background(150);
  textAlign(CENTER);
  textSize(60);
  textFont(font);
  fill(255);

  translate(cam.eyeX, cam.eyeY, cam.eyeZ);
  rotateY(-my.pan);
  rotateZ(my.tilt + 180);
  translate(400, 0, 0);
  rotateY(-90);
  rotateZ(180);
  
  translate(0, -60, 0);
  text("PAUSED", 0, 0);

  translate(0, 50, 0);
  textSize(30);
  text("Controls:", 0, 0);

  translate(0, 20, 0);
  textSize(10);
  text("E/Double click = Pause/Resume\nMouse = Look around\nWASD/Arrow keys = Movement\nSpace bar = Jump\nLeft Shift = Sprint\nB = Cycle sky\nI/K = Raise/Lower FOV", 0, 0);
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
    push();
    noStroke();
    fill(guest.color);
    
    // Body
    translate(guest.x, guest.y - YOUSIZE / 2, guest.z);
    rotateY(-guest.pan + 180);
    cylinder(YOUSIZE / 5, YOUSIZE);

    // Head
    translate(0, -YOUSIZE / 2, 0);
    rotateZ(-guest.tilt);
    box(YOUSIZE / 2);

    // Eyes
    fill(0);
    translate(YOUSIZE / 4, 0, YOUSIZE / 8);
    sphere(YOUSIZE / 16);
    translate(0, 0, -YOUSIZE / 4);
    sphere(YOUSIZE / 16);

    pop();
  }
}