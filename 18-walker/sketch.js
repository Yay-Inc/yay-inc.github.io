// Walker OOP Demo

let walkers = [];

class Walker {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 8);
    this.diameter = random(1, 8);
    this.color = color(random(0, 255), random(0, 255), random(0, 255));
  }

  display() {
    fill(this.color);
    circle(this.x, this.y, this.diameter);
  }

  move() {
    let angle = Math.floor(random(0, 4));
    if (angle === 0) {
      this.y += this.speed;
    }
    else if (angle === 1) {
      this.y -= this.speed;
    }
    else if (angle === 2) {
      this.x += this.speed;
    }
    else {
      this.x -= this.speed;
    }
  }
}

async function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();
}

function draw() {
  for (let w of walkers) {
    w.move();
    w.display();
  }
}

function mousePressed() {
  walkers.push(new Walker(mouseX, mouseY));
}

function keyPressed() {
  if (key === "s") {
    for (let i = 0; i < 100; i++) {
      walkers.push(new Walker(mouseX, mouseY));
    }
  }
}