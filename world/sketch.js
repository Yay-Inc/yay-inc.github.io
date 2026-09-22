// 3D World
// Asher Waldschmidt
// 10/1/2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let dirtImg;
let canyonImg;

let cam;


async function setup() {
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  canyonImg = await loadImage("assets/grand-canyon-panorama.jpg");
  
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCamera();
  cam.setPosition(0, -100, 0);
}

function draw() {
  background(220);
  lights();
  panorama(canyonImg);
  orbitControl();

  updateCam();
  setCamera(cam);

  scene();

}

function updateCam() {

}

function scene() {
  push();
  texture(dirtImg);
  box(10000, 1, 10000);
  pop();
}