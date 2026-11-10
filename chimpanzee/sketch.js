// Chimpanzee Test
// Asher Waldschmidt
// 11/16/2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const COLUMNS = 10;
const ROWS = 6;
let cellSize;
let grid;
let level = 3;
let nextNum = level;
let strikes = 0;
let mode = "start";

async function setup() {
  createCanvas(windowWidth, windowHeight);
  cellSize = Math.min(width / (COLUMNS + 2), height / (ROWS + 2));

  clearGrid();

  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background("black");
  textSize(cellSize);

  if (mode === "start") {
    fill("pink");
    text("ARE YOU SMARTER THAN A CHIMPANZEE?", 0, 0, width, height);
  }
  else if (mode === "test" || mode === "view") {
    drawGrid();
    fill("pink");
    text(String(level), width / 2, cellSize / 2);
    text("Strikes of 3: " + String(level), width / 2, height - cellSize / 2);
  }
}

function clearGrid() {
  grid = [];
  
  for (let y = 0; y < ROWS; y++) {
    let row = [];
    for (let x = 0; x < COLUMNS; x++) {
      row.push(0);
    }
    grid.push(row);
  }
}

function genLevel() {
  clearGrid();

  for (let i = 1; i <= level; i++) {
    let y = random(0, ROWS);
    let x = random(0, COLUMNS);
    
    while (grid[y][x] === 0) {
      y = random(0, ROWS);
      x = random(0, COLUMNS);
    }

    grid[y][x] = i;
  }
}

function drawGrid() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      if (grid[y][x] === 0) {
        fill("purple");
      }
      else {
        fill("pink");
      }
      
      square(x * cellSize + cellSize, y * cellSize + cellSize, cellSize);
      
      if (grid[y][x] !== 0 && mode === "view") {
        fill("white");
        text(String(grid[y][x]), x * cellSize + cellSize * 1.5, y * cellSize + cellSize * 1.5);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = Math.min(width / (COLUMNS + 2), height / (ROWS + 2));
}

function mousePressed() {
  if (mode === "start") {
    mode = "view";
    genLevel();
  }
  else if (mode === "test" || mode === "view") {
    mode = "test";

    let spotY = Math.floor(mouseY / cellSize + 1);
    let spotX = Math.floor(mouseX / cellSize + 1);
    if (grid[spotY][spotX] === nextNum) {
      grid[spotY][spotX] = 0;
      nextNum--;
    }
    else {
      strikes++;
    }
  }
}
