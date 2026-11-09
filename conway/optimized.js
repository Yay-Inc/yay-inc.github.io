// Conway's Game of Life

const expander = new Set([
  "-24,-1",
  "-23,-1",
  "-22,-1",
  "-21,-1",
  "-20,-1",
  "-19,-1",
  "-18,-1",
  "-17,-1",
  "-15,-1",
  "-14,-1",
  "-13,-1",
  "-12,-1",
  "-11,-1",
  "-7,-1",
  "-6,-1",
  "-5,-1",
  "2,-1",
  "3,-1",
  "4,-1",
  "5,-1",
  "6,-1",
  "7,-1",
  "8,-1",
  "10,-1",
  "11,-1",
  "12,-1",
  "13,-1",
  "14,-1"
]);

let grid = new Set();
let paused = true;
let erase = false;
let center = [0, 0];
let cellSize = 10;
let fps = 60;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(fps);
  grid.clear();
}

function draw() {
  background(255);

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
  
  drawLines();
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

function drawLines() {
  if (cellSize > 5) {
    strokeWeight(1);
    stroke(150);

    // vertical lines
    for (let i = 0; i <= Math.floor(width / 2 / cellSize); i++) {
      line(i * cellSize + width / 2, 0, i * cellSize + width / 2, height);
      line(-i * cellSize + width / 2, 0, -i * cellSize + width / 2, height);
    }
    
    // horizontal lines
    for (let i = 0; i <= Math.floor(height / 2 / cellSize); i++) {
      line(0, i * cellSize + height / 2, width, i * cellSize + height / 2);
      line(0, -i * cellSize + height / 2, width, -i * cellSize + height / 2);
    }
  }
}

function drawGrid() {
  fill(0);
  noStroke();
  //console.log(grid);
  for (let cellStr of grid) {
    let cell = cellStr.split(",");
    cell[0] = Number(cell[0]);
    cell[1] = Number(cell[1]);

    square((cell[0] + center[0]) * cellSize + width / 2, (cell[1] + center[1]) * cellSize + height / 2, cellSize);
  }
}

function updateGrid() {
  let nextGrid = new Set();

  for (let cellStr of grid) {
    let cell = cellStr.split(",");
    cell[0] = Number(cell[0]);
    cell[1] = Number(cell[1]);

    // count neighbours
    let neighbours = -1;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (grid.has([cell[0] + i, cell[1] + j].toString())) {
          neighbours++;
        }
      }
    }

    // continue this cell
    if (neighbours === 2 || neighbours === 3) {
      nextGrid.add(cell.toString());
    }

    // check around this cell
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (!grid.has([cell[0] + i, cell[1] + j].toString()) && !(i === 0 && j === 0)) {
          // check if this neighbour should come alive
          let neighbourNeighbours = 0;
          for (let n = -1; n <= 1; n++) {
            for (let m = -1; m <= 1; m++) {
              if (grid.has([cell[0] + i + n, cell[1] + j + m].toString())) {
                neighbourNeighbours++;
              }
            }
          }
          if (neighbourNeighbours === 3) {
            nextGrid.add([cell[0] + i, cell[1] + j].toString());
          }
        }
      }
    }
  }

  grid = nextGrid;
}

// function applyPattern(pattern) {
//   if (pattern.x < 0) {
//     pattern.x = grid[0].length + pattern.x;
//   }
//   if (pattern.y < 0) {
//     pattern.y = grid.length + pattern.y;
//   }

//   for (let y = 0; y < pattern.code.length; y++) {
//     for (let x = 0; x < pattern.code[y].length; x++) {
//       grid[y + pattern.y][x + pattern.x] = pattern.code[y][x];
//     }
//   }
// }

function keyPressed() {
  if (key === "p" || key === " ") {
    paused = !paused;
  }
  else if (key === "c") {
    grid.clear();
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
  // else if (int(key) >= 0 && int(key) <= 9) {
  //   applyPattern(PATTERNS[int(key)]);
  // }
}

function mousePressed() {
  if (!mouseButton.center) {
    let x = Math.floor((mouseX - width / 2) / cellSize) - center[0];
    let y = Math.floor((mouseY - height / 2) / cellSize) - center[1];
    
    if (grid.has([x, y].toString())) {
      grid.delete([x, y].toString());
      erase = true;
    }
    else {
      grid.add([x, y].toString());
      erase = false;
    }
  }
}

function mouseDragged() {
  if (mouseButton.center) {
    center[0] += Math.round(movedX / cellSize);
    center[1] += Math.round(movedY / cellSize);
  }
  else {
    let x = Math.floor((mouseX - width / 2) / cellSize) - center[0];
    let y = Math.floor((mouseY - height / 2) / cellSize) - center[1];
    let px = Math.floor((pmouseX - width / 2) / cellSize) - center[0];
    let py = Math.floor((pmouseY - height / 2) / cellSize) - center[1];
    
    if (y !== py || x !== px) {
      if (erase) {
        grid.delete([x, y].toString());
      }
      else {
        grid.add([x, y].toString());
      }
    }
  }
}

function mouseWheel(event) {
  if (event.delta > 0) {
    cellSize += 1;
  }
  else if (cellSize > 1) {
    cellSize -= 1;
  }
}