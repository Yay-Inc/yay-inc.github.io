// Terrain Generation Demo 2D with Perlin noise

const RES = 1;
const NOISEMOD = 0.001;

let terrain;

async function setup() {
  createCanvas(windowWidth * 10, windowHeight);
  generateTerrain();
}

function draw() {
  background(220);

  drawTerrain();
}

function generateTerrain() {
  terrain = [];
  
  let start = random(0, 100000);

  for (let i = 0; i < width; i += RES) {
    terrain.push(noise(start + i * NOISEMOD) * height);
  }
}

function drawTerrain() {
  fill(0);
  for (let i = 0; i < terrain.length; i++) {
    rect(i * RES, height - terrain[i], RES, terrain[i]);
  }
}


function mouseClicked() {
  generateTerrain();
}