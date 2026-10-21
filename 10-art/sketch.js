// Randomized Art Demo

let tiles = [];
const SIZE = 10;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = SIZE; i < width - SIZE; i += SIZE * 2) {
    for (let j = SIZE; j < height - SIZE; j += SIZE * 2) {
      tiles.push(spawnTile(i, j, SIZE));
    }
  }
}

function draw() {
  background(220);

  for (let tile of tiles) {
    line(tile.x1, tile.y1, tile.x2, tile.y2);
  }
}

function spawnTile(x, y, tileSize) {
  let tile;
  
  if (random() > 0.5) {
    tile = {
      x1: x - tileSize, 
      y1: y - tileSize,
      x2: x + tileSize,
      y2: y + tileSize,
    };
  }
  else {
    tile = {
      x1: x + tileSize, 
      y1: y - tileSize, 
      x2: x - tileSize, 
      y2: y + tileSize,
    };
  }

  return tile;
}

function mousePressed() {
  tiles = [];
  
  for (let i = SIZE; i < width - SIZE; i += SIZE * 2) {
    for (let j = SIZE; j < height - SIZE; j += SIZE * 2) {
      tiles.push(spawnTile(i, j, SIZE));
    }
  }
}