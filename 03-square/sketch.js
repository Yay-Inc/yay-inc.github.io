// Square moving around edge of screen

let size = 100;
let speed = 5;

let x = 0;
let y = 0;
let state = 0;

async function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  resizeCanvas(windowWidth, windowHeight);
  
  background(220);
  fill(0);

  if (state === 0) {
    y = 0;
    x += speed;
    if (x >= windowWidth - size) {
      state = 1;
    }
  }
  else if (state === 1) {
    x = windowWidth - size;
    y += speed;
    if (y >= windowHeight - size) {
      state = 2;
    }
  }
  else if (state === 2) {
    y = windowHeight - size;
    x -= speed;
    if (x <= 0) {
      state = 3;
    }
  }
  else if (state === 3) {
    x = 0;
    y -= speed;
    if (y <= 0) {
      state = 0;
    }
  }
  rect(x, y, size);
}