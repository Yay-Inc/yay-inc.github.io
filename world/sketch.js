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

let cam;

let x = 0;
let y = 0;
let z = 0;
let youSize = 200;
let speedX = 0;
let speedY = 0;
let speedZ = 0;

let sensitivity = 1;
let renDis = 10000;
let fov = 75;


async function setup() {
  dirtImg = await loadImage("assets/dirt-texture.jpg");
  skies.push(await loadImage("assets/sky2.jpg"));
  skies.push(await loadImage("assets/sky5.jpg"));
  skies.push(await loadImage("assets/sky9.jpg"));
  skies.push(await loadImage("assets/sky16.jpg"));
  
  createCanvas(windowWidth, windowHeight, WEBGL);

  angleMode(DEGREES);

  cam = createCamera();
  cam.setPosition(x, -youSize, y);
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
  // cam.
  
  cam.pan(-movedX / 4 * sensitivity);
  cam.tilt(movedY / 4 * sensitivity);
  
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
  texture(dirtImg);
  translate(0, 100, 0);
  rotateX(90);
  if (fov % 10 === 5) {
    plane(renDis);
  }
  pop();
}