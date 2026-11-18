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

let font;

const COLUMNS = 10;
const ROWS = 6;
let cellSize;
let grid;
let widthOffset;
let heightOffset;
let level = 4;
let nextNum = 1;
let strikes = 0;
let difficulty;
let mode = "start";
let message;

let buttons = [
  { text: "No Brainer", time: Infinity, hovered: 0 },
  { text: "Easy", time: 10000, hovered: 0 },
  { text: "Challenge", time: 5000, hovered: 0 },
  { text: "Impossible", time: 2000, hovered: 0 },
];
let buttonSize;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  windowResized();

  clearGrid();

  font = await loadFont("assets/DarumadropOne-Regular.ttf");
  textFont(font);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  
  noStroke();
}

function draw() {
  background(COLOURSCHEME.blue);

  if (mode === "start") {
    fill(COLOURSCHEME.yellow);
    textSize(cellSize * 1.5);
    text("ARE YOU SMARTER THAN A CHIMPANZEE?", width / 2, height / 2, width, height);
  }
  else if (mode === "menu") {
    fill(COLOURSCHEME.yellow);
    textSize(cellSize * 1.2);
    text("Choose a difficulty:", width / 2, height / 3);
    updateButtons();
    drawButtons();
  }
  else if (mode === "game over") {
    fill(COLOURSCHEME.yellow);
    textSize(cellSize * 1.5);
    text("GAME OVER", width / 2, height / 3);
    textSize(cellSize * 0.9);
    text("Final Score: " + String(level), width / 2, height * 2 / 3);
    textSize(cellSize * 0.3);
    fill(COLOURSCHEME.orange);
    text("(click to try again)", width / 2, height - cellSize);
    textSize(cellSize * 0.9);
  }
  else if (mode === "message") {
    fill(COLOURSCHEME.yellow);
    textSize(cellSize * 1.2);
    text(message, width / 2, height / 4);
    textSize(cellSize * 0.9);
    text(String(level) + " squares", width / 2, height / 2);
    text("Strike " + String(strikes) + " of 3", width / 2, height * 2 / 3);
    textSize(cellSize * 0.3);
    fill(COLOURSCHEME.orange);
    text("(click to start " + String(difficulty / 1000) + " second timer)", width / 2, height - cellSize);
  }
  else if (mode === "test" || mode === "view") {
    updateGrid();
    drawGrid();
    fill(COLOURSCHEME.yellow);
    textSize(cellSize * 0.9);
    text(String(level) + " squares", width / 2, (cellSize + heightOffset) / 2);
    text("Strike " + String(strikes) + " of 3", width / 2, height - (cellSize + heightOffset) / 2);
  }
}

function clearGrid() {
  grid = [];
  
  for (let y = 0; y < ROWS; y++) {
    let row = [];
    for (let x = 0; x < COLUMNS; x++) {
      row.push({ value: 0, hovered: 0 });
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

      if (grid[y][x].value === 0) {
        grid[y][x].value = i;
        break;
      }
    }
  }
}

function drawGrid() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      if (grid[y][x].value === 0) {
        fill(lerpColor(color(COLOURSCHEME.blue), color(COLOURSCHEME.green), grid[y][x].hovered));
        stroke(lerpColor(color(COLOURSCHEME.blue), color(COLOURSCHEME.green), grid[y][x].hovered));
      }
      else {
        fill(lerpColor(color(COLOURSCHEME.yellow), color(COLOURSCHEME.orange), grid[y][x].hovered));
        stroke(lerpColor(color(COLOURSCHEME.yellow), color(COLOURSCHEME.orange), grid[y][x].hovered));
      }
      
      square(x * cellSize + cellSize * 1.5 + widthOffset, y * cellSize + cellSize * 1.5 + heightOffset, cellSize * 0.9 + cellSize * 0.1 * grid[y][x].hovered, cellSize * 0.2);
      
      noStroke();
      if (grid[y][x].value !== 0 && mode === "view") {
        fill(COLOURSCHEME.red);
        textSize(cellSize * 0.9 + cellSize * 0.1 * grid[y][x].hovered);
        text(String(grid[y][x].value), x * cellSize + cellSize * 1.5 + widthOffset, y * cellSize + cellSize * 1.5 + heightOffset);
      }
    }
  }
}

function drawButtons() {
  for (let i = 0; i < buttons.length; i++) {
    fill(lerpColor(color(COLOURSCHEME.yellow), color(COLOURSCHEME.orange), buttons[i].hovered));
    square(i * buttonSize + buttonSize / 2 + widthOffset, height * 2 / 3, buttonSize * 0.9 + buttonSize * 0.1 * buttons[i].hovered, buttonSize * 0.2);

    fill(COLOURSCHEME.red);
    textSize(buttonSize * 0.16 + buttonSize * 0.01 * buttons[i].hovered);
    text(buttons[i].text, i * buttonSize + buttonSize / 2 + widthOffset, height * 2 / 3 - buttonSize / 6);
    textSize(buttonSize * 0.1 + buttonSize * 0.01 * buttons[i].hovered);
    text(String(buttons[i].time / 1000) + " seconds", i * buttonSize + buttonSize / 2 + widthOffset, height * 2 / 3 + buttonSize / 6);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = Math.min(width / (COLUMNS + 2), height / (ROWS + 2));
  textSize(cellSize * 0.9);
  widthOffset = (width - cellSize * (COLUMNS + 2)) / 2;
  heightOffset = (height - cellSize * (ROWS + 2)) / 2;
  buttonSize = (width - widthOffset * 2) / buttons.length;
}

function mousePressed() {
  if (mode === "start" || mode === "game over") {
    mode = "menu";
  }
  else if (mode === "menu" && mouseX >= widthOffset && mouseX <= width - widthOffset && mouseY >= height * 2 / 3 - buttonSize / 2 && mouseY <= height * 2 / 3 + buttonSize / 2) {
    let spotX = Math.floor((mouseX - widthOffset) / buttonSize);

    difficulty = buttons[spotX].time;
    
    mode = "message";
    message = "Starting...";
    level = 4;
    nextNum = 1;
  }
  else if (mode === "message") {
    mode = "view";
    genLevel();
  }
  else if ((mode === "test" || mode === "view") && mouseX >= widthOffset + cellSize && mouseX <= width - widthOffset - cellSize && mouseY >= heightOffset + cellSize && mouseY <= height - heightOffset - cellSize) {
    mode = "test";

    let spotY = Math.floor((mouseY - heightOffset) / cellSize - 1);
    let spotX = Math.floor((mouseX - widthOffset) / cellSize - 1);
    
    if (grid[spotY][spotX].value === nextNum) {
      grid[spotY][spotX].value = 0;

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
        mode = "game over";
      }
      else {
        message = "Wrong.";
      }
    }
  }
}

function updateGrid() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      if (grid[y][x].hovered > 0) {
        grid[y][x].hovered -= 0.1;
      }
      else {
        grid[y][x].hovered = 0;
      }
    }
  }
  
  if (mouseX >= widthOffset + cellSize && mouseX <= width - widthOffset - cellSize && mouseY >= heightOffset + cellSize && mouseY <= height - heightOffset - cellSize) {
    let spotY = Math.floor((mouseY - heightOffset) / cellSize - 1);
    let spotX = Math.floor((mouseX - widthOffset) / cellSize - 1);

    grid[spotY][spotX].hovered = 1;
  }
}

function updateButtons() {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].hovered > 0) {
      buttons[i].hovered -= 0.1;
    }
    else {
      buttons[i].hovered = 0;
    }
  }
  
  if (mouseX >= widthOffset && mouseX <= width - widthOffset && mouseY >= height * 2 / 3 - buttonSize / 2 && mouseY <= height * 2 / 3 + buttonSize / 2) {
    let spotX = Math.floor((mouseX - widthOffset) / buttonSize);

    buttons[spotX].hovered = 1;
  }
}