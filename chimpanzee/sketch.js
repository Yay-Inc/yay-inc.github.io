// Chimpanzee Test
// Asher Waldschmidt
// 11/16/2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const COLOURSCHEME = {
  blue: "#264653",
  green: "#2a9d8f",
  yellow: "#e9c46a",
  orange: "#f4a261",
  red: "#e76f51",
};

const COLUMNS = 10;
const ROWS = 6;
let cellSize;
let grid;
let widthOffset;
let heightOffset;
let level = 4;
let nextNum = 1;
let strikes = 0;
let mode = "start";
let message;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  windowResized();

  clearGrid();

  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background(COLOURSCHEME.blue);
  textSize(cellSize);

  if (mode === "start") {
    fill("pink");
    text("ARE YOU SMARTER THAN A CHIMPANZEE?", 0, 0, width, height);
  }
  else if (mode === "message") {
    fill("pink");
    text(message, width / 2, height / 4);
    text(String(level) + " squares", width / 2, height / 2);
    text("Strike " + String(strikes) + " of 3", width / 2, height * 3 / 4);
  }
  else if (mode === "test" || mode === "view") {
    drawGrid();
    fill("pink");
    text(String(level) + " squares", width / 2, cellSize / 2);
    text("Strike " + String(strikes) + " of 3", width / 2, height - cellSize / 2);
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
  
    while (true) {
      let y = Math.floor(random(0, ROWS));
      let x = Math.floor(random(0, COLUMNS));

      if (grid[y][x] === 0) {
        grid[y][x] = i;
        break;
      }
    }
  }
}

function drawGrid() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      if (grid[y][x] === 0) {
        fill("purple");
        stroke("purple");
      }
      else {
        fill("pink");
        stroke("pink");
      }
      
      square(x * cellSize + cellSize + widthOffset, y * cellSize + cellSize + heightOffset, cellSize);
      
      noStroke();
      if (grid[y][x] !== 0 && mode === "view") {
        fill("blue");
        text(String(grid[y][x]), x * cellSize + cellSize * 1.5 + widthOffset, y * cellSize + cellSize * 1.5 + heightOffset);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = Math.min(width / (COLUMNS + 2), height / (ROWS + 2));
  widthOffset = (width - cellSize * (COLUMNS + 2)) / 2;
  heightOffset = (height - cellSize * (ROWS + 2)) / 2;
}

function mousePressed() {
  if (mode === "start") {
    mode = "message";
    message = "Starting...";
  }
  else if (mode === "message") {
    mode = "view";
    genLevel();
  }
  else if ((mode === "test" || mode === "view") && mouseX >=  widthOffset && mouseX <= width - widthOffset && mouseY >=  heightOffset && mouseY <= height - heightOffset) {
    mode = "test";

    let spotY = Math.floor((mouseY - heightOffset) / cellSize - 1);
    let spotX = Math.floor((mouseX - widthOffset) / cellSize - 1);
    console.log(String(spotX) + String(spotY));
    if (grid[spotY][spotX] === nextNum) {
      grid[spotY][spotX] = 0;

      if (nextNum === level) {
        level++;
        nextNum = 1;
        mode = "message";
        message = "100% Correct!";
      }
      else {
        nextNum++;
      }
    }
    else {
      strikes++;
      nextNum = 1;
      mode = "message";
      if (strikes === 3) {
        message = "Game Over.";
        level = 4;
      }
      else {
        message = "Wrong.";
      }
    }
  }
}
