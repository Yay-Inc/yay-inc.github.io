let terrain;

let dirtImg;

const SIZE = 4000;
const RES = 20;
const HEIGHT = 500;
const MOD = 0.002;

async function setup() {
    dirtImg = await loadImage("assets/dirt-texture.jpg");
    
    createCanvas(windowWidth, windowHeight, WEBGL);

    terrain = new p5.Geometry();

    for (let i = 0; i < SIZE; i += RES) {
      for (let j = 0; j < SIZE; j += RES) {
        terrain.vertices.push(createVector(i - SIZE / 2, noise(i * MOD, j * MOD) * HEIGHT - 100, j - SIZE / 2));
      }
    }

    for (let i = 0; i < SIZE / RES - 1; i++) {
      for (let j = 0; j < SIZE / RES - 1; j++) {
        terrain.faces.push([i * SIZE / RES + j, i * SIZE / RES + j + 1, i * SIZE / RES + j + SIZE / RES]);
        terrain.faces.push([i * SIZE / RES + j + 1 + SIZE / RES, i * SIZE / RES + j + 1, i * SIZE / RES + j + SIZE / RES]);
      }
    }

    terrain.makeEdgesFromFaces();

    terrain.computeNormals();
}

function draw() {
    orbitControl();
    background(220);

    lights();

    //noStroke();
    fill("green");
    texture(dirtImg);
    
    model(terrain);
}