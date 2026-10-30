// Conway's Game of Life

let CELL = 20;
let grid;
let paused = true;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  clearGrid();
}

function draw() {
  background(220);
  stroke(200);

  if (!paused) {
    updateGrid();
  }
  
  drawGrid();
  
  if (paused) {
    fill(200, 20, 0, 100);
    triangle(width / 3, height / 4, width * 2 / 3, height / 2, width / 3, height * 3 / 4);
  }
  
  
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

function clearGrid() {
  grid = [];
  
  for (let y = 0; y < Math.floor(height / CELL); y++) {
    let row = [];
    for (let x = 0; x < Math.floor(width / CELL); x++) {
      row.push(0);
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

function updateGrid() {
  let nextGrid = structuredClone(grid);

  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[y].length - 1; x++) {
      let neighbours = grid[y - 1][x - 1] + grid[y - 1][x] + grid[y - 1][x + 1] + grid[y][x - 1] + grid[y][x + 1] + grid[y + 1][x - 1] + grid[y + 1][x] + grid[y + 1][x + 1];
      if (grid[y][x] === 1) {
        if (neighbours < 2 || neighbours > 3) {
          nextGrid[y][x] = 0;
        }
        else {
          nextGrid[y][x] = 1;
        }
      }
      else if (neighbours === 3) {
        nextGrid[y][x] = 1;
      }
    }
  }

  grid = nextGrid;
}

function keyPressed() {
  if (key === "p") {
    paused = !paused;
  }
  else if (key === "r") {
    genGrid();
  }
  else if (key === "c") {
    clearGrid();
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