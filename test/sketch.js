// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let pos = {x: 0, y: 0};

async function setup() {
  // connect to a p5party server
  await partyConnect(
    "wss://demoserver.p5party.org",
    "hello_party"
  );
  
  // tell p5.party to sync the pos object
  pos = await partyLoadShared("pos", pos);

  createCanvas(400, 400);
}

function draw() {
  background(50);
  ellipse(pos.x, pos.y, 100, 100);
}

function mousePressed() {
  pos.x = mouseX;
  pos.y = mouseY;
}