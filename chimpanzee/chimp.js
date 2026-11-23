// Chimpanzee test grid based game
// Asher Waldschmidt
// 11/16/2026
//
// Extra for Experts:
// - I used objects in the arrays to store button and grid info
// - I made everything adjust to the size of the window, and it *mostly works on mobile (*it's clunky and mouseX/mouseY only update on taps)
// - I used lerpColor to fade between colors and made a color scheme object
// - I made two games with different html and js files, connected with one main html file

const COLOURSCHEME = {
  blue: "#264653",
  green: "#2a9d8f",
  yellow: "#e9c46a",
  orange: "#f4a261",
  red: "#e76f51",
};

let font;
let missClickGif;

const COLUMNS = 10;
const ROWS = 6;
let cellSize;
let grid;
let widthOffset;
let heightOffset;

let level = 4;
let nextNum = 1;
let strikes = 0;
let missClick = false;

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

  clearGrid();

  missClickGif = await loadImage("assets/missclick.gif");

  font = await loadFont("assets/DarumadropOne-Regular.ttf");
  textFont(font);
  textAlign(CENTER, CENTER);
  
  rectMode(CENTER);
  imageMode(CENTER);
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
  else if (mode === "test" || mode === "view") {
    drawGame();
  }
}

function drawStart() {
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 1.5);
  text("ARE YOU SMARTER THAN A CHIMPANZEE?", width / 2, height / 2, width * 0.9, height);

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
  textSize(cellSize * 1.5);
  text("GAME OVER", width / 2, height / 3);
  
  textSize(cellSize * 0.9);
  text("Final Score: " + String(level), width / 2, height * 2 / 3);
  
  textSize(cellSize * 0.3);
  fill(COLOURSCHEME.orange);
  text("(click to try again)", width / 2, height - cellSize);
  
  textSize(cellSize * 0.9);

  if (missClick && width >= 1200) {
    image(missClickGif, width * 4 / 5, height * 2 / 3);
    image(missClickGif, width / 5, height * 2 / 3);
  }
}

function drawMessage() {
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 1.2);
  text(message, width / 2, height / 4);
  
  textSize(cellSize * 0.9);
  text(String(level) + " squares", width / 2, height / 2);
  
  text("Strike " + String(strikes) + " of 3", width / 2, height * 2 / 3);
  
  textSize(cellSize * 0.3);
  fill(COLOURSCHEME.orange);
  text("(click to start " + String(difficulty / 1000) + " second timer)", width / 2, height - cellSize);

  textSize(cellSize * 0.9);

  if (missClick && width >= 1200) {
    image(missClickGif, width * 4 / 5, height * 2 / 3);
    image(missClickGif, width / 5, height * 2 / 3);
  }
}

function drawGame() {
  if (timerStart + difficulty < millis()) {
    mode = "test";
  }

  if (mode === "view") {
    drawTimer();
  }

  updateGrid();
  drawGrid();
  
  fill(COLOURSCHEME.yellow);
  textSize(cellSize * 0.9);
  text(String(level) + " squares", width / 2, (cellSize + heightOffset) / 2);
  
  text("Strike " + String(strikes) + " of 3", width / 2, height - (cellSize + heightOffset) / 2);
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
    // try to add the next spot until it's not already taken
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
      
      // draw number if viewing
      noStroke();
      if (grid[y][x].value !== 0 && mode === "view") {
        fill(COLOURSCHEME.red);
        
        // adjust for double digits
        if (grid[y][x].value > 9) {
          textSize(cellSize * 0.7 + cellSize * 0.1 * grid[y][x].hovered);
        }
        else {
          textSize(cellSize * 0.9 + cellSize * 0.1 * grid[y][x].hovered);
        }
        
        text(String(grid[y][x].value), x * cellSize + cellSize * 1.5 + widthOffset, y * cellSize + cellSize * 1.5 + heightOffset);
      }
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
    
    missClick = false;
    mode = "message";
    message = "Starting...";
    level = 4;
    nextNum = 1;
  }
  else if (mode === "message") {
    mode = "view";
    genLevel();

    // start timer
    timerStart = millis();
  }
  else if ((mode === "test" || mode === "view") && mouseX >= widthOffset + cellSize && mouseX <= width - widthOffset - cellSize && mouseY >= heightOffset + cellSize && mouseY <= height - heightOffset - cellSize) {
    mode = "test";

    let spotY = Math.floor((mouseY - heightOffset) / cellSize - 1);
    let spotX = Math.floor((mouseX - widthOffset) / cellSize - 1);
    
    if (grid[spotY][spotX].value === nextNum) {
      // correct
      grid[spotY][spotX].value = 0;
      missClick = false;

      if (nextNum === level) {
        // all done level
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
      // incorrect
      strikes++;
      nextNum = 1;
      
      if (strikes >= 3) {
        mode = "game over";
        strikes = 0;
      }
      else {
        mode = "message";
        message = "Wrong.";
      }
      
      // if you click on a spot that is 0, it is a miss-click
      missClick = grid[spotY][spotX].value === 0;
    }
  }
}

function updateGrid() {
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