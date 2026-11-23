// Image memory test grid based game
// Asher Waldschmidt
// 11/16/2026

// Extra for experts:
// - Same as chimp.js

const COLOURSCHEME = {
  gray: "#262c2f",
  blue: "#264653",
  green: "#2a9d8f",
  yellow: "#e9c46a",
  orange: "#f4a261",
  red: "#e76f51",
};

let font;

const COLUMNS = 5;
const ROWS = 5;
let cellSize;

let viewGrid;
let testGrid;

let widthOffset;
let heightOffset;

const LEVELS = 5;
let scores = [];
let final;

let difficulty;
let timerStart;

let mode = "start";
let message;

let buttons = [
  { text: "No Brainer", time: Infinity, hovered: 0 },
  { text: "Easy", time: 10000, hovered: 0 },
  { text: "Challenge", time: 4000, hovered: 0 },
  { text: "Impossible", time: 1500, hovered: 0 },
];
let buttonSize;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  windowResized();

  viewGrid = clearGrid();
  testGrid = clearGrid();

  font = await loadFont("assets/DarumadropOne-Regular.ttf");
  textFont(font);
  textAlign(CENTER, CENTER);
  
  rectMode(CENTER);
  noStroke();
}

function draw() {
  background(COLOURSCHEME.blue);

  if (mode === "start") {
    drawStart();
  }
  else if (mode === "menu") {
    drawMenu();
  }
  else if (mode === "game over") {
    drawEnd();
  }
  else if (mode === "message") {
    drawMessage();
  }
  else if (mode === "view") {
    drawView();
  }
  else if (mode === "test") {
    drawTest();
  }
}

function drawStart() {
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 1.2);
  text("DO YOU HAVE A PHOTOGRAPHIC MEMORY?", width / 2, height / 2, width * 0.9, height);
  
  textSize(cellSize * 0.3);
  fill(COLOURSCHEME.orange);
  text("(click to begin)", width / 2, height - cellSize);
}

function drawMenu() {
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 1.2);
  text("Choose a difficulty:", width / 2, height / 3);
  
  updateButtons();
  drawButtons();
}

function drawEnd() {
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 1.2);
  text("FINISHED", width / 2, height / 3);
  
  textSize(cellSize * 0.9);
  text("Average Score: " + String(Math.round(final * 100)) + "%", width / 2, height * 2 / 3);
  
  textSize(cellSize * 0.3);
  fill(COLOURSCHEME.orange);
  text("(click to try again)", width / 2, height - cellSize);
  
  textSize(cellSize * 0.9);
}

function drawMessage() {
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 0.9);
  text(message, width / 2, height / 3);

  text("Test " + String(scores.length + 1) + " of " + String(LEVELS), width / 2, height * 2 / 3);
  
  textSize(cellSize * 0.3);
  fill(COLOURSCHEME.orange);
  
  text("(click to start " + String(difficulty / 1000) + " second timer)", width / 2, height - cellSize);

  textSize(cellSize * 0.9);
}

function drawView() {
  if (timerStart + difficulty < millis()) {
    mode = "test";
    testGrid = clearGrid();
  }
  else {
    drawTimer();
    
    viewGrid = updateGrid(viewGrid);
    drawGrid(viewGrid);
    
    fill(COLOURSCHEME.yellow);
    textSize(cellSize * 0.9);
    text("Remember this image:", width / 2, (cellSize + heightOffset) / 2);
    
    textSize(cellSize * 0.3);
    fill(COLOURSCHEME.orange);
    text("(click below grid when ready)", width / 2, height - (cellSize + heightOffset) / 2);
    
    textSize(cellSize * 0.9);
  }
}

function drawTest() {
  testGrid = updateGrid(testGrid);
  drawGrid(testGrid);
  
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 0.9);
  text("Draw the image:", width / 2, (cellSize + heightOffset) / 2);
  
  textSize(cellSize * 0.3);
  fill(COLOURSCHEME.orange);
  text("(click below grid when done)", width / 2, height - (cellSize + heightOffset) / 2);
  
  textSize(cellSize * 0.9);
}

function clearGrid() {
  let thisGrid = [];
  
  for (let y = 0; y < ROWS; y++) {
    let row = [];

    for (let x = 0; x < COLUMNS; x++) {
      row.push({ value: 0, hovered: 0 });
    }

    thisGrid.push(row);
  }

  return thisGrid;
}

function genLevel() {
  viewGrid = clearGrid();

  for (let i = 0; i < Math.floor(random(ROWS * COLUMNS / 4, ROWS * COLUMNS * 2 / 3)); i++) {
    // try to add the next spot until it's not already taken
    while (true) {
      let y = Math.floor(random(0, ROWS));
      let x = Math.floor(random(0, COLUMNS));

      if (viewGrid[y][x].value === 0) {
        viewGrid[y][x].value = 1;
        break;
      }
    }
  }
}

function drawGrid(grid) {
  // draw extra background so you can see which cells can be used
  fill(COLOURSCHEME.gray);
  stroke(COLOURSCHEME.gray);
  rect(width / 2, height / 2, COLUMNS * cellSize + cellSize * 0.2, ROWS * cellSize + cellSize * 0.2, cellSize * 0.2);
  
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      // fade colours based on hovered value
      if (grid[y][x].value === 0) {
        fill(lerpColor(color(COLOURSCHEME.blue), color(COLOURSCHEME.green), grid[y][x].hovered));
        stroke(lerpColor(color(COLOURSCHEME.blue), color(COLOURSCHEME.green), grid[y][x].hovered));
      }
      else {
        fill(lerpColor(color(COLOURSCHEME.yellow), color(COLOURSCHEME.orange), grid[y][x].hovered));
        stroke(lerpColor(color(COLOURSCHEME.yellow), color(COLOURSCHEME.orange), grid[y][x].hovered));
      }
      
      // size is also based on hovered value
      square(x * cellSize + cellSize * 1.5 + widthOffset, y * cellSize + cellSize * 1.5 + heightOffset, cellSize * 0.9 + cellSize * 0.1 * grid[y][x].hovered, cellSize * 0.2);
    
      noStroke();
    }
  }
}

function drawButtons() {
  for (let i = 0; i < buttons.length; i++) {
    // fade colors and size based on hovered value
    fill(lerpColor(color(COLOURSCHEME.yellow), color(COLOURSCHEME.orange), buttons[i].hovered));
    square(i * buttonSize + buttonSize / 2 + cellSize, height * 2 / 3, buttonSize * 0.9 + buttonSize * 0.1 * buttons[i].hovered, buttonSize * 0.2);

    fill(COLOURSCHEME.red);
    textSize(buttonSize * 0.16 + buttonSize * 0.01 * buttons[i].hovered);
    text(buttons[i].text, i * buttonSize + buttonSize / 2 + cellSize, height * 2 / 3 - buttonSize / 6);
    
    textSize(buttonSize * 0.1 + buttonSize * 0.01 * buttons[i].hovered);
    text(String(buttons[i].time / 1000) + " seconds", i * buttonSize + buttonSize / 2 + cellSize, height * 2 / 3 + buttonSize / 6);
  }
}

function drawTimer() {
  // progress is a percentage or infinity (if difficulty is infinity)
  let progress = (timerStart + difficulty - millis()) / difficulty;
  
  if (progress > 0 && progress !== Infinity) {
    // length in pixels that the bar should be
    let length = (width + height) * progress;
    
    rectMode(CORNER);
    fill(COLOURSCHEME.green);
    noStroke();

    if (length >= width / 2) {
      // draw full top
      rect(0, 0, width, cellSize * 0.1);
      
      if (length >= width / 2 + height) {
        // draw full sides
        rect(0, 0, cellSize * 0.1, height);
        rect(width, 0, -cellSize * 0.1, height);
        
        // draw portion of bottom
        rect(0, height, length - height - width / 2, -cellSize * 0.1);
        rect(width, height, -(length - height - width / 2), -cellSize * 0.1);
      }
      else {
        // draw portion of sides
        rect(0, 0, cellSize * 0.1, length - width / 2);
        rect(width, 0, -cellSize * 0.1, length - width / 2);
      }
    }
    else {
      // draw portion of top
      rect(width / 2 - length, 0, length * 2, cellSize * 0.1);
    }
    
    rectMode(CENTER);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight * 0.9);
  
  // there is a minimum gap around grid of one cellSize
  cellSize = Math.min(width / (COLUMNS + 2), height / (ROWS + 2));
  textSize(cellSize * 0.9);
  
  // one of these will always be zero
  widthOffset = (width - cellSize * (COLUMNS + 2)) / 2;
  heightOffset = (height - cellSize * (ROWS + 2)) / 2;
  
  buttonSize = (width - cellSize * 2) / buttons.length;
}

function mousePressed() {
  if (mode === "start" || mode === "game over") {
    mode = "menu";
  }
  else if (mode === "menu" && mouseX >= cellSize && mouseX <= width - cellSize && mouseY >= height * 2 / 3 - buttonSize / 2 && mouseY <= height * 2 / 3 + buttonSize / 2) {
    // clicked on button in menu
    
    let spotX = Math.floor((mouseX - cellSize) / buttonSize);

    // objects in buttons include their time as a property
    difficulty = buttons[spotX].time;
    
    mode = "message";
    message = "Starting...";
  }
  else if (mode === "message") {
    mode = "view";
    genLevel();
    
    // start timer
    timerStart = millis();
  }
  else if (mode === "view" && mouseY > height - heightOffset - cellSize) {
    mode = "test";
    testGrid = clearGrid();
  }
  else if (mode === "test") {
    if (mouseX >= widthOffset + cellSize && mouseX <= width - widthOffset - cellSize && mouseY >= heightOffset + cellSize && mouseY <= height - heightOffset - cellSize) {
      // edit to the test grid
      let spotY = Math.floor((mouseY - heightOffset) / cellSize - 1);
      let spotX = Math.floor((mouseX - widthOffset) / cellSize - 1);

      if (testGrid[spotY][spotX].value === 0) {
        testGrid[spotY][spotX].value = 1;
      }
      else {
        testGrid[spotY][spotX].value = 0;
      }
    }
    else if (mouseY > height - heightOffset - cellSize){
      // test grid is finished

      // scoring the grid:
      let correct = 0;
      let total = 0;
      let goal = 0;
      
      for (let y = 0; y < COLUMNS; y++) {
        for (let x = 0; x < ROWS; x++) {
          if (testGrid[y][x].value === viewGrid[y][x].value) {
            correct++;
          }
          total += testGrid[y][x].value;
          goal += viewGrid[y][x].value;
        }
      }

      // score is out of 100%: 
      // - 50% for how many were correctly selected/unselected out of all of the cells
      // - 50% for difference of selected in test grid vs view grid 
      let score = (correct / (ROWS * COLUMNS) + 1 - Math.abs(total - goal) / (ROWS * COLUMNS - goal)) / 2;
      scores.push(score);

      if (scores.length < LEVELS) {
        // next test
        mode = "message";
        message = "Score: " + String(Math.round(score * 100)) + "%";
      }
      else {
        // done all tests
        mode = "game over";
        
        // final average score
        final = 0;
        for (let i of scores) {
          final += i;
        }
        final = final / scores.length;
      }
    }
  }
}

function updateGrid(grid) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      // decrease hovered value gradually for fading effect
      if (grid[y][x].hovered > 0) {
        grid[y][x].hovered -= 0.1;
      }
      else {
        grid[y][x].hovered = 0;
      }
    }
  }
  
  // find the spot mouse is over and make its hovered value stay at full
  if (mouseX >= widthOffset + cellSize && mouseX <= width - widthOffset - cellSize && mouseY >= heightOffset + cellSize && mouseY <= height - heightOffset - cellSize) {
    let spotY = Math.floor((mouseY - heightOffset) / cellSize - 1);
    let spotX = Math.floor((mouseX - widthOffset) / cellSize - 1);

    grid[spotY][spotX].hovered = 1;
  }

  return grid;
}

function updateButtons() {
  for (let i = 0; i < buttons.length; i++) {
    // decrease hovered value gradually for fading effect
    if (buttons[i].hovered > 0) {
      buttons[i].hovered -= 0.1;
    }
    else {
      buttons[i].hovered = 0;
    }
  }
  
  // find which button mouse is over and make its hovered value stay at full
  if (mouseX >= cellSize && mouseX <= width - cellSize && mouseY >= height * 2 / 3 - buttonSize / 2 && mouseY <= height * 2 / 3 + buttonSize / 2) {
    let spotX = Math.floor((mouseX - cellSize) / buttonSize);

    buttons[spotX].hovered = 1;
  }
}