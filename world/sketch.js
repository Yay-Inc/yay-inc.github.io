// 3D World
// Asher Waldschmidt
// 10/1/2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let dirtImg;
let panos = [];
let panoNum = 0;

let paused = true;

let cam;
let x = 0;
let y = 0;
let sensitivity = 1;
let fov = 75;
let youSize = 200;


async function setup() {
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  panos.push(await loadImage("assets/desert-pano.jpg"));
  panos.push(await loadImage("assets/grass-pano.jpg"));
  panos.push(await loadImage("assets/tundra-pano.png"));
  
  createCanvas(windowWidth, windowHeight, WEBGL);

  angleMode(DEGREES);

  cam = createCamera();
  cam.setPosition(x, -youSize, y);
}

function draw() {
  resizeCanvas(windowWidth, windowHeight);
  
  background(220);
  lights();
  panorama(panos[panoNum]);
  // orbitControl();

  setCamera(cam);
  cam.perspective(fov);
  updateCam();

  scene();

}

function keyPressed() {
  if (key === "b") {
    if (panoNum < panos.length - 1) {
      panoNum++;
    }
    else {
      panoNum = 0;
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
  cam.tilt(movedY / 4 * sensitivity);
}

function scene() {
  push();
  texture(dirtImg);
  box(10000, 1, 10000);
  pop();
}