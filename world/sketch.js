// 3D World
// Asher Waldschmidt
// 10/2/2026
//
// Extra for Experts:
// - Worked in 3D with WEBGL canvas
// - Used classes and vectors
// - Used p5.party to host multiplayer world

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
let skiesLightMaps = [];
let grassModel;
let font;

let paused = true;

let my = { x: 10000, y: 0, z: 10000, fov: 75, pan: 90, tilt: 0, color: "black" };
const YOUSIZE = 100;
let speedX = 0;
let speedY = 0;
let speedZ = 0;

let cam;
let cam2;
let camMode = 0;
let sensitivity = 1;
const RENDIS = 20000;
let guests;
let shared;
let lastFov = -1000;
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
    
    terrain.computeNormals();

    this.terrain = terrain;
    
    // Setup trees
    this.trees = [];
    let numTree = Math.floor(random(size / 200, size / 50));
    
    // Add trees with random dimensions
    for (let i = 0; i < numTree; i++) {
      let tree = {};
      tree.treeHeight = random(300, 1000);
      
      tree.treeWidth = random(tree.treeHeight / 5, tree.treeHeight / 1.5);
      tree.x = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      tree.z = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      tree.y = noise((tree.x + size) * MOD, (tree.z + size) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
      
      this.trees.push(tree);
    }

    // Setup rocks
    this.rocks = [];
    let numRock = Math.floor(random(size / 100, size / 50));
    
    // Add rocks with random dimensions
    for (let i = 0; i < numRock; i++) {
      let rock = {};
      rock.size = random(30, 150);
      
      rock.x = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      rock.z = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      rock.y = noise((rock.x + size) * MOD, (rock.z + size) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;

      rock.shade = random(70, 130);
      
      this.rocks.push(rock);
    }

    // Setup grass
    this.grass = [];

    for (let i = -size; i < size; i += TERRAINRES / 1.5) {
      for (let j = -size; j < size; j += TERRAINRES / 1.5) {
        let ground = noise((i + size) * MOD, (j + size) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
        if (ground < -TERRAINHEIGHT / 4 && random() > 0.9) {
          let blade = {};
          blade.x = i;
          blade.y = ground;
          blade.z = j;
          
          this.grass.push(blade);
        }
      }
    }
  }
}


async function setup() {
  // connect to a p5party server
  await partyConnect(
    "wss://demoserver.p5party.org",
    "world"
  );
  
  shared = await partyLoadShared("shared", { seed: 0, trees: [], rocks: [], sky: -1 });
  my = await partyLoadMyShared(my);
  guests = await partyLoadGuestShareds();

  // Load ground and sky images
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  for (let i = 1; i < 16; i++) {
    skies.push(await loadImage(`assets/sky${i}.jpg`));
    skiesLightMaps.push(await loadImage(`assets/sky${i}.jpg`));
  }

  // Load 3d models
  grassModel = await loadModel("assets/ribbon_grass_tbdpec3r_ue_low.obj", true);

  font = await loadFont("assets/Genjibold.otf");



  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);

  if (shared.seed === 0) {
    shared.seed = Math.floor(random(1, 100));
  }
  noiseSeed(shared.seed);

  if (shared.sky === -1) {
    shared.sky = Math.floor(random(0, skies.length));
  }
  for (let n of skiesLightMaps) {
    n.filter(THRESHOLD, 0.9);
  }

  // Generate world
  world = new World(RENDIS);
  if (partyIsHost()) {
    shared.trees = world.trees;
    shared.rocks = world.rocks;
  }

  my.color = COMMONWEBCOLORS[Math.floor(Math.random() * COMMONWEBCOLORS.length)];
  
  cam2 = createCamera();
  cam = createCamera();
  cam.setPosition(my.x, my.y - YOUSIZE, my.z);
  cam.perspective(my.fov, width / height, 5, RENDIS * 2);

  background(120);
}

function draw() {
  // Check if paused
  if (!paused) {
    lights();
    imageLight(skiesLightMaps[shared.sky]);
    checkMoveInput();
    updateCam();
    scene();
    hud();
  }
  else {
    pauseScreen();
  }
}

function keyPressed() {  
  // Switch sky
  if (key.toLowerCase() === "b") {
    if (shared.sky < skies.length - 1) {
      shared.sky++;
    }
    else {
      shared.sky = 0;
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
    lastFov = millis();
  }

  // Decrease FOV
  else if (key.toLowerCase() === "k" && my.fov > 25) {
    my.fov -= 5;
    lastFov = millis();
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
  
  let accelX = 0;
  let accelZ = 0;

  // Forward and Back
  if (keyIsDown("w") || keyIsDown("W") || keyIsDown(UP_ARROW)) {
    accelZ = -20;
 
  }
  else if (keyIsDown("s") || keyIsDown(DOWN_ARROW)) {
    accelZ = 10;
  }

  // Strafe
  if (keyIsDown("a") || keyIsDown(LEFT_ARROW)) {
    accelX = -8;
  }
  else if (keyIsDown("d") || keyIsDown(RIGHT_ARROW)) {
    accelX = 8;
  }
  
  // Jump
  if (keyIsDown("Space") && my.y >= ground - 20) {
    speedY = -20;
  }
  // if (keyIsDown("Shift")) {
  //   accelZ *= 2;
  // }

  // Gets rotated movement vector
  let rotated = createVector(accelX, accelZ);
  rotated.rotate(my.pan - 90);

  speedX = lerp(speedX, rotated.x, 0.1);
  speedZ = lerp(speedZ, rotated.y, 0.1);

  // Check for collisions
  let d = checkCollision(my.x, my.y, my.z, speedX, speedY, speedZ);

  speedX = d.x;
  speedY = d.y;
  speedZ = d.z;

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
  
  background(120);
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
  if (keyIsDown("l")) {
    texture(skiesLightMaps[shared.sky]);
  }
  else {
    texture(skies[shared.sky]);
  }
  sphere(RENDIS - 500, 100);
  pop();
  
  // Draw the ground
  push();
  noStroke();
  texture(dirtImg);
  model(world.terrain);
  pop();

  // Draw water
  push();
  noStroke();
  fill("blue");
  rotateX(-90);
  translate(0, TERRAINHEIGHT / 2, 0);
  plane(RENDIS * 2);
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

  // Draw rocks
  for (let i = 0; i < shared.rocks.length; i++) {
    let rock = shared.rocks[i];
    
    push();
    noStroke();
    translate(rock.x, rock.y - rock.size / 1.5, rock.z);
    fill(rock.shade);
    sphere(rock.size);
    pop();
  }

  // Draw grass
  for (let i = 0; i < world.grass.length; i++) {
    push();
    normalMaterial();
    translate(world.grass[i].x, world.grass[i].y, world.grass[i].z);
    fill(50, 110, 30);
    model(grassModel);
    pop();
  }
  
  // Draw people
  if (keyIsDown("l")) {
    console.log(guests);
  }

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

function hud() {
  clearDepth();

  push();
  translate(cam.eyeX, cam.eyeY, cam.eyeZ);
  rotateY(-my.pan);
  rotateZ(my.tilt + 180);
  translate(200 / tan(my.fov / 2), 0, 0);
  rotateY(-90);
  rotateZ(180);

  noFill();
  stroke(255);
  if (camMode === 0) {
    circle(0, 0, 10);
  }

  textAlign(CENTER);
  textFont(font);
  fill(255);

  if (lastFov + 1000 > millis()) {
    translate(-100, -60, 0);
    textSize(30);
    text(`FOV: ${my.fov}`, 0, 0);
  }

  pop();
}

function checkCollision(x, y, z, dx, dy, dz) {
  let d = createVector(dx, dy, dz);
  
  // Check sky
  if (dist(0, 0, 0, x, y, z) > RENDIS - YOUSIZE - 500) {
    
    let v = createVector(dist(0, 0, 0, x, y, z) - (RENDIS - YOUSIZE - 500), 0);
    v.setHeading(180 + createVector(x, z).heading());
    d.add(createVector(v.x, 0, v.y));
    
    console.log("collide sky");
  }
  
  return d;
}