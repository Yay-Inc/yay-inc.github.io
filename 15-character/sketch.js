// Character in grid demo

const CELL = 80;
const OPEN_TILE = 0;
const IMPASSIBLE = 1;
const PLAYER_THING = 67;
const MOVE_DELAY = 10;
let grid;
let player = {
  x: 0,
  y: 0,
};

async function setup() {
  createCanvas(windowWidth, windowHeight);

  genGrid();
  grid[player.y][player.x] = PLAYER_THING;
}

function draw() {
  background(220);
  checkInput();
  drawGrid();
}

function genGrid() {
  grid = [];
  
  for (let y = 0; y < Math.floor(height / CELL); y++) {
    let row = [];
    for (let x = 0; x < Math.floor(width / CELL); x++) {
      if (random(0, 2) > 1) {
        row.push(IMPASSIBLE);
      }
      else {
        row.push(OPEN_TILE);
      }
    }
    grid.push(row);
  }
}

function drawGrid() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === IMPASSIBLE) {
        fill(0);
      }
      else if (grid[y][x] === OPEN_TILE) {
        fill(255);
      }
      else if (grid[y][x] === PLAYER_THING) {
        fill("red");
      }
      square(x * CELL, y * CELL, CELL);
    }
  }
}

function checkInput() {
  if (frameCount % MOVE_DELAY === 0) {
  
    if (keyIsDown("w")) {
      movePlayer(player.x, player.y - 1);
    }
    if (keyIsDown("s")) {
      movePlayer(player.x, player.y + 1);
    }
    if (keyIsDown("a")) {
      movePlayer(player.x - 1, player.y);
    }
    if (keyIsDown("d")) {
      movePlayer(player.x + 1, player.y);
    }
  }
}

function keyPressed() {
  if (key === "r") {
    genGrid();
  }
}

function movePlayer(x, y) {
  if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length && grid[y][x] !== IMPASSIBLE) {
    grid[player.y][player.x] = OPEN_TILE;
    
    player.x = x;
    player.y = y;

    grid[y][x] = PLAYER_THING;
  }
}

function mousePressed() {
  if (grid[Math.floor(mouseY / CELL)][Math.floor(mouseX / CELL)] === IMPASSIBLE) {
    grid[Math.floor(mouseY / CELL)][Math.floor(mouseX / CELL)] = OPEN_TILE;
  }
  else if (grid[Math.floor(mouseY / CELL)][Math.floor(mouseX / CELL)] === OPEN_TILE) {
    grid[Math.floor(mouseY / CELL)][Math.floor(mouseX / CELL)] = IMPASSIBLE;
  }
}