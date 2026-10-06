// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


async function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  stroke(random(0, 255), random(0, 255), random(0, 255));
  strokeWeight(random(0, 8));
  fill(random(0, 255), random(0, 255), random(0, 255));
  circle(random(0, width), random(0, height), random(20, 200));

}
