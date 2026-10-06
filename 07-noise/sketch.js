// Perlin Noise Demo

let time = 0;
let dt = 0.01;

async function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);

  let x = noise(time) * width;
  let y = noise(time + 1234) * height;

  fill(0);
  circle(x, y, 50);

  time += dt;
}
