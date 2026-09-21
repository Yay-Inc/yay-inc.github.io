// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let RAD = 40;

globalThis.instances = [];

function setup() {
  createCanvas(windowWidth,  windowHeight, WEBGL);
}


class Ball {
  constructor(startX, startY, startZ) {
    this.x = startX;
    this.y = startY;
    this.z = startZ;

    this.speedX = random([-10, -9, -8, -7, -6, -5, -4, 4, 5, 6, 7, 8, 9, 10]);
    this.speedY = 0;
    this.speedZ = random([-10, -9, -8, -7, -6, -5, -4, 4, 5, 6, 7, 8, 9, 10]);

    this.squishX = 1;
    this.squishY = 1;
    this.squishZ = 1;
    this.flipX = false;
    this.flipY = false;
    this.flipZ = false;

    this.color = color(random(0, 255), random(0, 255), random(0, 255));
  }

  move() {
    if (Math.abs(this.x + this.speedX) >= width / 2 - RAD * this.squishX) {
      //console.log("BOING");
      
      this.speedX *= 0.97;
      this.flipX = true;
  
      this.squishX = 1 - Math.abs(this.speedX) / 10;
      this.squishY = 1 + Math.abs(this.speedX) / 20;
      this.squishZ = 1 + Math.abs(this.speedX) / 20;
    }

    if (Math.abs(this.z + this.speedZ) >= width / 2- RAD * this.squishZ) {
      //console.log("BOING");
      
      this.speedZ *= 0.97;
      this.flipZ = true;
  
      this.squishZ = 1 - Math.abs(this.speedX) / 10;
      this.squishY = 1 + Math.abs(this.speedX) / 20;
      this.squishX = 1 + Math.abs(this.speedX) / 20;
    }
      
    if (Math.abs(this.speedX) < 1 && Math.abs(this.speedZ) < 1) {
      let index = globalThis.instances.indexOf(this);
      globalThis.instances.splice(index, 1);
    }
  
    if (Math.abs(this.y + this.speedY) >= height / 2 - RAD * this.squishY) {
      this.speedY *= 0.9;
      this.flipY = true;
      
      this.speedX *= 0.99;
      this.speedZ *= 0.99;
      
      if (Math.abs(this.speedY) < 0.01) {
        this.speedY = 0;
      }
      else if (Math.abs(this.speedY) >= 1) {
        //console.log("BOING");
        
        this.squishX = 1 + Math.abs(this.speedY) / 20;
        this.squishZ = 1 + Math.abs(this.speedY) / 20;
        this.squishY = 1 - Math.abs(this.speedY) / 15;
      }
    }
    else {
      this.speedY += 0.3;
    }

    push();
    noStroke();
    fill(this.color);
    translate(this.x, this.y, this.z);
    
    ellipsoid(RAD * this.squishX, RAD * this.squishY, RAD * this.squishZ);
    
    pop();

    this.x += this.speedX;
    this.y += this.speedY;
    this.z += this.speedZ;
  
    this.squishX = (this.squishX + 0.2) / 1.2;
    this.squishY = (this.squishY + 0.2) / 1.2;
    this.squishZ = (this.squishZ + 0.2) / 1.2;
  
    if (this.flipX) {
      this.speedX *= -1;
      this.flipX = false;
    }
    if (this.flipY) {
      this.speedY *= -1;
      this.flipY = false;
    }
    if (this.flipZ) {
      this.speedZ *= -1;
      this.flipZ = false;
    }
  }

  static updateAll() {
    globalThis.instances.forEach((instance) => {
      instance.move();
    });
  }
}


function draw() {
  resizeCanvas(windowWidth,  windowHeight);

  frameRate(60);
  background("white");
  orbitControl();
  lights();
  drawEdges();
  
  if (keyIsDown(" ")) {
    globalThis.instances.push(
      new Ball(random((width - RAD * 2) / -2, (width - RAD * 2) / 2), random(height / -2 + RAD, height / -4), random((width - RAD * 2) / -2, (width - RAD * 2) / 2)));
  }

  Ball.updateAll();
}

function drawEdges() {
  push();
  translate(width / -2 - RAD / 2, 0, 0);
  stroke(0);
  fill(220);
  box(RAD, height, width);
  pop();

  push();
  translate(width / 2 + RAD / 2, 0, 0);
  stroke(0);
  noFill();
  box(RAD, height, width);
  pop();

  push();
  translate(0, 0, width / -2 - RAD / 2);
  stroke(0);
  fill(220);
  box(width, height, RAD);
  pop();

  push();
  translate(0, 0, width / 2 + RAD / 2);
  stroke(0);
  noFill();
  box(width, height, RAD);
  pop();

  push();
  translate(0, height / 2 + RAD / 2, 0);
  stroke(0);
  fill(120);
  box(width, RAD, width);
  pop();
}