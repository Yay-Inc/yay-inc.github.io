// 3D World
// Asher Waldschmidt
// 10/1/2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// https://www.philohome.com/skycollec/skycollec.htm

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
let renDis = 10000;
let fov = 75;

let world;

class World {
  constructor(size) {
    // this.trees = new Array(Math.floor(random(50, 200))).fill(new Map());

    // for (let i = 0; i < this.trees.length; i++) {
    //   let treeHeight = random(100, 500);
    //   this.trees[i].set("treeHeight", treeHeight);
    //   this.trees[i].set("treeWidth", random(treeHeight / 5, treeHeight / 1.5));
    //   this.trees[i].set("x", random(-renDis / 10, renDis / 10) * 10);
    //   this.trees[i].set("z", random(-renDis / 10, renDis / 10) * 10);
    // }

    this.trees = [];
    let num = Math.floor(random(50, 200));
    
    for (let i = 0; i < num; i++) {
      let tree = new Map();
      let treeHeight = random(100, 500);
      
      tree.set("treeHeight", treeHeight);
      tree.set("treeWidth", random(treeHeight / 5, treeHeight / 1.5));
      tree.set("x", random(-renDis / 10, renDis / 10) * 10);
      tree.set("z", random(-renDis / 10, renDis / 10) * 10);
      
      this.trees.push(tree);
    }
  }
}

async function setup() {
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  skies.push(await loadImage("assets/sky2.jpg"));
  skies.push(await loadImage("assets/sky5.jpg"));
  skies.push(await loadImage("assets/sky9.jpg"));
  skies.push(await loadImage("assets/sky16.jpg"));
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);

  cam = createCamera();
  cam.setPosition(x, y - youSize, z);

  world = new World(renDis);
}

function draw() {
  resizeCanvas(windowWidth, windowHeight);
  
  background(220);
  lights();
  strokeMode(SIMPLE);
  // orbitControl();

  updateCam();

  scene();

}

function keyPressed() {
  if (key === "b") {
    if (skyNum < skies.length - 1) {
      skyNum++;
    }
    else {
      skyNum = 0;
    }
  }
  else if (key === "Escape" && !paused) {
    paused = true;
    exitPointerLock();
  }
  else if (key === "i" && fov < 120) {
    fov += 5;
    console.log(fov);
  }
  else if (key === "k" && fov > 25) {
    fov -= 5;
    console.log(fov);
  }
}

function doubleClicked() {
  if (paused) {
    paused = false;
    requestPointerLock();
  }
  else {
    paused = true;
    exitPointerLock();
  }
}

function updateCam() {
  
  
  cam.pan(-movedX / 4 * sensitivity);
  
  if (cam.centerY < 795 + y - youSize && movedY > 0 || cam.centerY > -795 + y - youSize && movedY < 0) {
    cam.tilt(movedY / 4 * sensitivity);
  }

  cam.perspective(fov, width / height, youSize / 4, renDis * 2);

  setCamera(cam);
}

function scene() {
  // Draw the sky
  push();
  noStroke();
  texture(skies[skyNum]);
  sphere(renDis);
  pop();
  
  // Draw the ground
  push();
  noStroke();
  // textureMode(NORMAL);
  // textureWrap(MIRROR);
  texture(dirtImg);
  translate(0, 100, 0);
  rotateX(90);
  plane(renDis * 2);
  pop();

  // Draw trees
  for (let i = 0; i < world.trees.length; i++) {
    let tree = world.trees[i];
    
    push();
    noStroke();
    translate(tree.get("x"), 0, tree.get("z"));
    fill(80, 50, 10);
    cylinder(tree.get("treeHeight") / 10, tree.get("treeHeight"));

    translate(0, -tree.get("treeHeight") / 2, 0);
    fill(40, 100, 40);
    cone(tree.get("treeWidth"), -tree.get("treeHeight"));
    pop();
  }
}