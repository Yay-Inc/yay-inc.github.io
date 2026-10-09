// Object Notation and Arrays
// Bouncing Circles
// Date

let theCircles = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();
}

function draw() {
  background(220);

  spawnCircle();
  theCircles.forEach(drawCircle);
}

function mousePressed() {
  
}

function spawnCircle() {
  let theCircle = {
    x: mouseX,
    y: mouseY,
    dx: random(-10, 10),
    dy: random(-10, 10),
    radius: random(10, 50),
    rgb: color(random(255), random(255), random(255)),
  };

  theCircles.push(theCircle);
}

function drawCircle(theCircle) {
  theCircle.x += theCircle.dx;
  theCircle.y += theCircle.dy;

  fill(theCircle.rgb);
  circle(theCircle.x, theCircle.y, theCircle.radius);

  if (theCircle.x <= theCircle.radius || theCircle.x >= width - theCircle.radius) {
    theCircle.dx *= -1;
  }

  if (theCircle.y <= theCircle.radius || theCircle.y >= height - theCircle.radius) {
    theCircle.dy *= -1;
  }
}