// Grid Demo
// 2D arrays

let grid = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);

  genGrid();
}

function draw() {
  background(220);

  drawGrid();
}

function genGrid() {
  grid = [];
  
  for (let y = 0; y < random(8, 100); y++) {
    let row = [];
    for (let x = 0; x < random(8, 100); x++) {
      row.push(Math.floor(random(0, 2)));
    }
    grid.push(row);
  }
}

function drawGrid() {
  let sizeY = height / grid.length;

  for (let y = 0; y < grid.length; y++) {
    let sizeX = width / grid[y].length;
    for (let x = 0; x < grid[y].length; x++) {
      fill(grid[y][x] * 255);
      rect(x * sizeX, y * sizeY, sizeX, sizeY);
    }
  }
}

function mousePressed() {
  genGrid();
}