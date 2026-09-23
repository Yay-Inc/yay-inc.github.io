// 3D World
// Asher Waldschmidt
// 10/1/2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let dirtImg;
let panos = [];
let panoNum = 0;

let cam;


async function setup() {
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  panos.push(await loadImage("assets/desert-pano.jpg"));
  panos.push(await loadImage("assets/grass-pano.jpg"));
  panos.push(await loadImage("assets/tundra-pano.png"));
  
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCamera();
  cam.setPosition(0, -100, 0);
}

function draw() {
  resizeCanvas(windowWidth, windowHeight);
  
  background(220);
  lights();
  panorama(panos[panoNum]);
  // orbitControl();

  updateCam();
  setCamera(cam);

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
}

function mouseMoved(event) {
  cam.tilt(10 / event.movementY);
}

function updateCam() {

}

function scene() {
  push();
  texture(dirtImg);
  box(10000, 1, 10000);
  pop();
}