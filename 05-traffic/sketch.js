// Traffic Light Starter Code
// Asher Waldschmidt
// 9/28/2026

// GOAL: make a 'traffic light' simulator. For now, just have the light
// changing according to time. You may want to investigate the millis()
// function at https://p5js.org/reference/#/p5/millis

let state = "green";
let lastTime = 0;

async function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(255);
  checkTime();
  drawOutlineOfLights();
}

function checkTime() {
  if (state === "green" && lastTime + 2500 <= millis()) {
    state = "yellow";
    lastTime = millis();
  }
  else if (state === "yellow" && lastTime + 500 <= millis()) {
    state = "red";
    lastTime = millis();
  }
  else if (state === "red" && lastTime + 3000 <= millis()) {
    state = "green";
    lastTime = millis();
  }
}

function drawOutlineOfLights() {
  //box
  rectMode(CENTER);
  fill(0);
  rect(width/2, height/2, 75, 200, 10);

  //lights
  fill(255);
  ellipse(width/2, height/2 - 65, 50, 50); //top
  ellipse(width/2, height/2, 50, 50); //middle
  ellipse(width/2, height/2 + 65, 50, 50); //bottom

  fill(state);
  if (state === "red") {
    ellipse(width/2, height/2 - 65, 50, 50);
  }
  else if (state === "yellow") {
    ellipse(width/2, height/2, 50, 50);
  }
  else {
    ellipse(width/2, height/2 + 65, 50, 50);
  }
}