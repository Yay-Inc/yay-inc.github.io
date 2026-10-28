// Grid Demo
// 2D arrays

let CELL = 80;
let grid;

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
  
  for (let y = 0; y < Math.floor(height / CELL); y++) {
    let row = [];
    for (let x = 0; x < Math.floor(width / CELL); x++) {
      row.push(Math.floor(random(0, 2)));
    }
    grid.push(row);
  }
}

function drawGrid() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      fill(grid[y][x] * 255);
      square(x * CELL, y * CELL, CELL);
    }
  }
}

function keyPressed() {
  if (key === "r") {
    genGrid();
  }
}

function mousePressed() {
  if (grid[Math.floor(mouseY / CELL)][Math.floor(mouseX / CELL)] === 1) {
    grid[Math.floor(mouseY / CELL)][Math.floor(mouseX / CELL)] = 0;
  }
  else {
    grid[Math.floor(mouseY / CELL)][Math.floor(mouseX / CELL)] = 1;
  }
}