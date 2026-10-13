// p5.Collide2D Library demo

let hit = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);

  hit = collideRectCircle(300, 400, 200, 150, mouseX, mouseY, 100);

  rect(300, 400, 200, 150);
  
  if (hit) {
    fill("red");
  }
  else {
    fill(0);
  }
  
  circle(mouseX, mouseY, 100);
}
