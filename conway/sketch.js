// Conway's Game of Life

const GOSPER_GUN = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], 
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1], 
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
];

const DRAGON = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1], 
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1], 
  [1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1], 
  [1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1], 
  [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1], 
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], 
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], 
  [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1], 
  [1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1], 
  [1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1], 
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
];

const PATTERNS = [{ code: GOSPER_GUN, x: 10, y: 10}, { code: DRAGON, x: -35, y: -25}];

const CELL = 15;
let grid;
let paused = true;
let erase = false;
let fps = 60;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(fps);
  clearGrid();
}

function draw() {
  background(220);
  strokeWeight(1);
  stroke(150);

  if (!paused) {
    updateGrid();
    if (fps > 60) {
      for (let i = 0; i < Math.floor(fps / 60) - 1; i++) {
        updateGrid();
      }
      if (random(0, 60) > fps % 60) {
        updateGrid();
      }
    }
  }
  
  drawGrid();
  
  if (paused) {
    fill(200, 20, 0, 100);
    triangle(height / 5, height / 5, height / 5, height * 2 / 5, height * 2 / 5, height * 3 / 10);
  }

  if (keyIsDown("f")) {
    updateGrid();
    if (keyIsDown("v")) {
      updateGrid();
    }
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
      if (grid[y][x] === 0) {
        fill(255);
      }
      else {
        fill(0);
      }
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

function applyPattern(pattern) {
  if (pattern.x < 0) {
    pattern.x = grid[0].length + pattern.x;
  }
  if (pattern.y < 0) {
    pattern.y = grid.length + pattern.y;
  }

  for (let y = 0; y < pattern.code.length; y++) {
    for (let x = 0; x < pattern.code[y].length; x++) {
      grid[y + pattern.y][x + pattern.x] = pattern.code[y][x];
    }
  }
}

function keyPressed() {
  if (key === "p" || key === " ") {
    paused = !paused;
  }
  else if (key === "r") {
    genGrid();
  }
  else if (key === "c") {
    clearGrid();
  }
  else if (key === "n" && paused) {
    updateGrid();
  }
  else if (key === ".") {
    fps *= 1.5;
    frameRate(Math.round(fps));
  }
  else if (key === ",") {
    fps *= 1 / 1.5;
    frameRate(Math.round(fps));
  }
  else if (int(key) >= 0 && int(key) <= 9) {
    applyPattern(PATTERNS[int(key)]);
  }
}

function mousePressed() {
  let y = Math.floor(mouseY / CELL);
  let x = Math.floor(mouseX / CELL);
  
  if (grid[y][x] === 1) {
    grid[y][x] = 0;
    erase = true;
  }
  else {
    grid[y][x] = 1;
    erase = false;
  }
}

function mouseDragged() {
  let y = Math.floor(mouseY / CELL);
  let x = Math.floor(mouseX / CELL);
  let py = Math.floor(pmouseY / CELL);
  let px = Math.floor(pmouseX / CELL);
  
  if (y !== py || x !== px) {
    if (erase) {
      grid[y][x] = 0;
    }
    else {
      grid[y][x] = 1;
    }
  }
}