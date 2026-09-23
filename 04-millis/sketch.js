// Millis demo

let waitTime = 2000;

async function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  if (millis() % (waitTime * 2) < waitTime) {
    background(0);

  }
  else {
    background("red");
  }

  // console.log(millis());
}
