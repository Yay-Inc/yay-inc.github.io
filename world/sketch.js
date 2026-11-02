// 3D World
// Asher Waldschmidt
// 10/2/2026
//
// Extra for Experts:
// - Worked in 3D with WEBGL canvas
// - Used classes and vectors
// - Used p5.party to host multiplayer world

// Where I got sky equirectangular photos: https://www.philohome.com/skycollec/skycollec.htm
// 3d Models are from OpenGameArt.org and Free3D.com, but I edited them in blender

const COMMON_WEB_COLORS = [
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

const CONTROLS = "E/Double click = Pause/Resume\nMouse = Look around\nWASD/Arrow keys = Movement\nSpace bar = Jump\nQ = Show who is online\nT = Chat (press Enter to send message)\nC = Camera Zoom\nZ/X = Raise/Lower FOV\nB = Cycle sky";

let dirtImg;
let skies = [];
let skiesLightMaps = [];
let grassModel;
let treeModel;
let rockModels = [];
let titleModel;
let font;

let paused = true;
let chatting = false;
let message = "";

let my = { 
  x: 0, 
  y: 0, 
  z: 0, 
  fov: 75, 
  pan: 90, 
  tilt: 0, 
  color: "black",
};

const RUN_SPEED = 20;
const WALK_SPEED = 8;
const JUMP_SPEED = -20;
const MOVE_LERP = 0.1;
const PLAYER_SIZE = 100;
let speedX = 0;
let speedY = 0;
let speedZ = 0;

let cam;
let cam2;
let camMode = 0;
let sensitivity = 1;
const ALT_CAMERA_DISTANCE = 2.5;
const RENDER_DISTANCE = 20000;
let guests;
let shared;
let lastFov = -1000;
let skyCollide = false;
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
    let numTree = Math.floor(random(size / 200, size / 100));
    
    // Add trees with random dimensions
    for (let i = 0; i < numTree; i++) {
      let tree = {};
      tree.scale = random(800, 1500) / treeModel.trunk.calculateBoundingBox().size.y;
      
      tree.x = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      tree.z = Math.floor(random(-size / TERRAINRES, size / TERRAINRES)) * TERRAINRES;
      tree.y = noise((tree.x + size) * MOD, (tree.z + size) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
      if (tree.y <= 0) {
        this.trees.push(tree);
      }
    }

    // Setup rocks
    this.rocks = [];
    let numRock = Math.floor(random(size / 100, size / 50));
    
    // Add rocks with random dimensions
    for (let i = 0; i < numRock; i++) {
      let rock = {};
      rock.model = Math.floor(random(0, 6));
      
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
  
  shared = await partyLoadShared("shared", { seed: 0, trees: [], rocks: [], sky: -1, chat: [] });
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

  for (let i = 1; i < 7; i++) {
    rockModels.push(await loadModel(`assets/rock_d_0${i}.obj`));
  }

  treeModel = {
    trunk: await loadModel("assets/MapleTreeStem.obj"),
    leaves: await loadModel("assets/MapleTreeLeaves.obj"),
  };

  font = await loadFont("assets/Genjibold.otf");

  createCanvas(windowWidth, windowHeight, WEBGL);

  angleMode(DEGREES);

  titleModel = font.textToModel("W o r l d", 0, 0, { extrude: 2, sampleFactor: 3 });
  titleModel.normalize();

  if (shared.seed === 0) {
    shared.seed = Math.floor(random(1, 100));
  }
  noiseSeed(shared.seed);

  if (shared.sky === -1) {
    shared.sky = Math.floor(random(0, skies.length));
  }
  for (let map of skiesLightMaps) {
    map.filter(THRESHOLD, 0.9);
  }

  // Generate world
  world = new World(RENDER_DISTANCE);
  if (partyIsHost()) {
    shared.trees = world.trees;
    shared.rocks = world.rocks;
  }

  my.color = COMMON_WEB_COLORS[Math.floor(Math.random() * COMMON_WEB_COLORS.length)];
  
  cam2 = createCamera();
  cam = createCamera();
  cam.setPosition(my.x, my.y - PLAYER_SIZE, my.z);
  cam.perspective(my.fov, width / height, 5, RENDER_DISTANCE * 2);

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
  if (chatting) {
    // Send chat message
    if (key === "Enter") {
      if (shared.chat.length > 10) {
        shared.chat.pop();
      }
      if (message.length > 0) {
        shared.chat.splice(0, 0, { text: message, color: my.color });
      }
      chatting = false;
      message = "";
    }
    else if (key === "Backspace") {
      message = message.slice(0, -1);
    }
    else if (key.length === 1) {
      message += key;
    }
  }
  else {
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

    // Chat
    else if (key.toLowerCase() === "t") {
      chatting = true;
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
    else if (key.toLowerCase() === "z" && my.fov < 120) {
      my.fov += 5;
      lastFov = millis();
    }

    // Decrease FOV
    else if (key.toLowerCase() === "x" && my.fov > 25) {
      my.fov -= 5;
      lastFov = millis();
    }
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
  const ground = noise((my.x + RENDER_DISTANCE) * MOD, (my.z + RENDER_DISTANCE) * MOD) * TERRAINHEIGHT - TERRAINHEIGHT / 2;
  
  let accelX = 0;
  let accelZ = 0;

  if (!chatting) {
    // Forward and Back
    if (keyIsDown("w") || keyIsDown("W") || keyIsDown(UP_ARROW)) {
      accelZ = -RUN_SPEED;
  
    }
    else if (keyIsDown("s") || keyIsDown(DOWN_ARROW)) {
      accelZ = WALK_SPEED;
    }

    // Strafe
    if (keyIsDown("a") || keyIsDown(LEFT_ARROW)) {
      accelX = -WALK_SPEED;
    }
    else if (keyIsDown("d") || keyIsDown(RIGHT_ARROW)) {
      accelX = WALK_SPEED;
    }
    
    // Jump
    if (keyIsDown("Space") && my.y >= ground - 20) {
      speedY = JUMP_SPEED;
    }
  }
  
  // Gets rotated movement vector
  let rotated = createVector(accelX, accelZ);
  rotated.rotate(my.pan - 90);

  speedX = lerp(speedX, rotated.x, MOVE_LERP);
  speedZ = lerp(speedZ, rotated.y, MOVE_LERP);

  // Check for collisions
  let fixedMovement = checkCollision(my.x, my.y, my.z, speedX, speedY, speedZ);

  my.x += fixedMovement.x;
  my.y += fixedMovement.y;
  my.z += fixedMovement.z;

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
  cam.setPosition(my.x, my.y - PLAYER_SIZE, my.z);
  
  // Rotate camera based on mouse movements
  cam.pan(-movedX / 4 * sensitivity);
  if (cam.centerY < 795 + my.y - PLAYER_SIZE && movedY > 0 || cam.centerY > -795 + my.y - PLAYER_SIZE && movedY < 0) {
    cam.tilt(movedY / 4 * sensitivity);
  }

  // found this math here: https://editor.p5js.org/rjgilmour/sketches/DKDWmmvrm
  my.pan = atan2(cam.eyeZ - cam.centerZ, cam.eyeX - cam.centerX);
  my.tilt = atan2(cam.eyeY - cam.centerY, dist(cam.centerX, cam.centerZ, cam.eyeX, cam.eyeZ));

  // Update perspective
  if (keyIsDown("c") && !chatting) {
    cam.perspective(15, width / height, 10, RENDER_DISTANCE * 2);
  }
  else {
    cam.perspective(my.fov, width / height, 10, RENDER_DISTANCE * 2);
  }

  if (camMode === 1) {
    cam.move(0, 0, PLAYER_SIZE * ALT_CAMERA_DISTANCE);
    setCamera(cam);
  }
  else if (camMode === 2) {
    let cam2 = createCamera();
    cam2.set(cam);
    cam2.pan(180);
    cam2.move(0, 0, PLAYER_SIZE * ALT_CAMERA_DISTANCE);
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
  text(CONTROLS, 0, 0);
}

function scene() {
  background(220);
  noStroke();

  drawSky();  
  drawTerrain();
  drawFlora();
  drawPeople();
  drawWater();
}

function drawSky() {
  // Draw the sky
  push();
  texture(skies[shared.sky]);
  sphere(RENDER_DISTANCE - 500, 100);
  pop();
  
  // Draw title
  push();
  fill(my.color);
  rotateX(60);
  translate(0, -RENDER_DISTANCE / 1.1, 0);
  rotateX(-90);
  scale(60);
  model(titleModel);
  pop();
}

function drawTerrain() {
  // Draw the ground
  push();
  texture(dirtImg);
  model(world.terrain);
  pop();
  
  // Draw rocks
  for (let i = 0; i < shared.rocks.length; i++) {
    let rock = shared.rocks[i];
    
    push();
    translate(rock.x, rock.y, rock.z);
    fill(rock.shade);
    scale(100);
    model(rockModels[rock.model]);
    pop();
  }
}

function drawFlora() {
  // Draw trees
  for (let i = 0; i < shared.trees.length; i++) {
    let tree = shared.trees[i];
    
    // Trunk
    push();
    translate(tree.x, tree.y, tree.z);
    rotateX(180);
    scale(tree.scale);
    fill(80, 50, 10);
    model(treeModel.trunk);

    // Leaves
    fill(40, 100, 40);
    model(treeModel.leaves);
    pop();
    
  }

  // Draw grass
  for (let i = 0; i < world.grass.length; i++) {
    push();
    translate(world.grass[i].x, world.grass[i].y, world.grass[i].z);
    fill(50, 110, 30);
    model(grassModel);
    pop();
  }
}

function drawPeople() {
  for (const guest of guests) {
    if (guest !== my || camMode !== 0) { 
      push();
      fill(guest.color);
      
      // Body
      translate(guest.x, guest.y - PLAYER_SIZE / 2, guest.z);
      rotateY(-guest.pan + 180);
      cylinder(PLAYER_SIZE / 5, PLAYER_SIZE);

      // Head
      translate(0, -PLAYER_SIZE / 2, 0);
      rotateZ(-guest.tilt);
      box(PLAYER_SIZE / 2);

      // Eyes
      fill(0);
      translate(PLAYER_SIZE / 4, 0, PLAYER_SIZE / 8);
      sphere(PLAYER_SIZE / 16);
      translate(0, 0, -PLAYER_SIZE / 4);
      sphere(PLAYER_SIZE / 16);

      pop();
    }
  }
}

function drawWater() {
  push();
  fill(0, 0, 255, 180);
  rotateX(-90);
  plane(RENDER_DISTANCE * 2);
  pop();

  // Add filter if under water
  if (my.y - PLAYER_SIZE > 0) {
    push();
    fill(0, 0, 255, 80);
    translate(cam.eyeX, cam.eyeY, cam.eyeZ);
    rotateY(-my.pan);
    rotateZ(my.tilt + 180);
    translate(15, 0, 0);
    rotateY(-90);
    rotateZ(180);
    if (camMode !== 2) {
      plane(10000);
    }
    else {
      rotateY(180);
      translate(0, 0, PLAYER_SIZE * ALT_CAMERA_DISTANCE - 30);
      plane(10000);
    }
    pop();
  }
}

function hud() {
  clearDepth();

  push();
  // Setup for 2D drawing
  translate(cam.eyeX, cam.eyeY, cam.eyeZ);
  rotateY(-my.pan);
  rotateZ(my.tilt + 180);
  if (keyIsDown("c") && !chatting) {
    translate(200 / tan(15 / 2), 0, 0);
  }
  else {
    translate(200 / tan(my.fov / 2), 0, 0);
  }
  rotateY(-90);
  rotateZ(180);

  noFill();
  stroke(255);

  drawUtilities();

  textAlign(CENTER);
  textFont(font);
  fill(255);

  drawAlerts();

  textAlign(LEFT);
  fill(my.color);
  textSize(15);

  drawChat();
  
  fill(255);

  if (keyIsDown("q")) {
    drawOnlineList();
  }

  pop();
}

function drawUtilities() {
  // Crosshair
  if (camMode === 0) {
    circle(0, 0, 10);
    if (keyIsDown("c") && !chatting) {
      circle(0, 0, 40);
    }
  }
}

function drawAlerts() {
  if (skyCollide) {
    translate(0, 60, 0);
    textSize(20);
    text("Out of Bounds", 0, 0);
    translate(0, -60, 0);
  }

  if (lastFov + 1000 > millis()) {
    translate(100, -60, 0);
    textSize(30);
    text(`FOV: ${my.fov}`, 0, 0);
    translate(-100, 60, 0);
  }
}

function drawChat() {
  if (chatting) {
    textAlign(CENTER);
    translate(0, 60, 0);
    textSize(20);
    text("Chatting...", 0, 0);
    translate(0, -60, 0);
    textAlign(LEFT);
    translate(-width / 6, height / 7.3, 0);
    textSize(15);
    text(message, 0, 0);
    translate(-20, -7, 0);
    noStroke();
    rect(0, 0, 16, 5);
    translate(20, 7, 0);
    translate(width / 6, -height / 7.3, 0);
  }

  translate(-width / 6, height / 7.3, 0);
  for (let i = 0; i < shared.chat.length; i++) {
    translate(0, -18 * (i + 1), 0);
    fill(shared.chat[i].color);
    text(shared.chat[i].color.charAt(0).toUpperCase() + shared.chat[i].color.slice(1) + ": " + shared.chat[i].text, 0, 0);
    translate(0, 18 * (i + 1), 0);
  }
  translate(width / 6, -height / 7.3, 0);
}

function drawOnlineList() {
  translate(-width / 9, -height / 9, 0);
  textSize(30);
  text("Online:", 0, 0);
  
  textSize(20);
  translate(0, 30, 0);
  fill(my.color);
  text(`${my.color.charAt(0).toUpperCase() + my.color.slice(1)} (You)`, 0, 0);
  
  for (const guest of guests) {
    if (guest !== my) {
      translate(0, 30, 0);
      fill(guest.color);
      text(guest.color.charAt(0).toUpperCase() + guest.color.slice(1), 0, 0);
    }
  }
}

function checkCollision(x, y, z, dx, dy, dz) {
  let fixedMovement = createVector(dx, dy, dz);
  
  // Check sky
  if (dist(0, 0, 0, x, y, z) > RENDER_DISTANCE - PLAYER_SIZE - 500) {
    
    let toInsideSky = createVector(dist(0, 0, 0, x, y, z) - (RENDER_DISTANCE - PLAYER_SIZE - 500), 0);
    toInsideSky.setHeading(180 + createVector(x, z).heading());
    fixedMovement.add(createVector(toInsideSky.x, 0, toInsideSky.y));
    
    skyCollide = true;
  }
  else {
    skyCollide = false;
  }
  
  return fixedMovement;
}