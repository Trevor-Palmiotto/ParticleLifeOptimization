var canvas = document.getElementById('myCanvas');
const rMax = 100;
canvas.width = Math.floor(innerWidth / rMax) * rMax;
canvas.height = Math.floor(innerHeight / rMax) * rMax;
console.log(canvas.width);
console.log(canvas.height);
var c = canvas.getContext('2d');

const w = canvas.width / rMax;
const h = canvas.height / rMax;
const n = 1000;
const dt = 0.02;
const frictionHalfLife = 0.040;
const m = 6;
var matrix = makeRandomMatrix();
const forceFactor = 10;
var grid = new Map();
const frictionFactor = Math.pow(0.5, dt / frictionHalfLife);

function makeRandomMatrix() {
    const rows = [];
    for (let i = 0; i < m; i++) {
        const row = [];
        for (let j = 0; j < m; j++) {
            row.push(Math.random() * 2 - 1); 
        }
        rows.push(row);
    }
    return rows;
}

function getNearestNeighbors(wd, ht) {
    // returns neighboring grids in index format
    // console.log(wd);
    // console.log(ht);
    var Hs = [
        ((ht - 1) + h) % h,
        ((ht) + h) % h,
        ((ht + 1) + h) % h
    ];
    var Ws = [
        ((wd - 1) + w) % w,
        ((wd) + w) % w,
        ((wd + 1) + w) % w
    ];
    var NN = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            NN.push(Hs[i] * w + Ws[j]);
        }
    }
    return NN;
}

window.addEventListener("click", function() {
    matrix = makeRandomMatrix();
})

function Particle(positionX, positionY, velocityX, velocityY, color, index) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.color = color;
    this.index = index;

    this.updateVelocity = function() {
        let totalForceX = 0;
        let totalForceY = 0;
        var NNs = getNearestNeighbors(Math.floor(this.positionX / rMax), Math.floor(this.positionY / rMax));
        // console.log(NNs);
        // console.log(grid.get(Math.floor(this.positionX / rMax) + Math.floor(this.positionY / rMax) * w));
        for (let i = 0; i < NNs.length; i++){
            if (grid.has(NNs[i])) {
                var pArray = grid.get(NNs[i]);
                pArray.forEach(p => {
                    if (p == this.index) return;
                    
                    var rx = particleArray[p].positionX - this.positionX;
                    var ry = particleArray[p].positionY - this.positionY;

                    if (Math.abs(rx) > (canvas.width / 2)) {
                        rx = (canvas.width - Math.abs(rx)) * -rx / Math.abs(rx);
                    }
                    if (Math.abs(ry) > (canvas.height / 2)) {
                        ry = (canvas.height - Math.abs(ry)) * -ry / Math.abs(ry);
                    }
                    const r = Math.hypot(rx, ry);
                    if (r > 0 && r < rMax) {
                        const f = force(r / rMax, matrix[this.color][particleArray[p].color]);
                        totalForceX += rx / r * f;
                        totalForceY += ry / r * f;
                    }
                });
            }
        }
        totalForceX *= rMax * forceFactor;
        totalForceY *= rMax * forceFactor;
        
        this.velocityX *= frictionFactor;
        this.velocityY *= frictionFactor;

        this.velocityX += totalForceX * dt;
        this.velocityY += totalForceY * dt;
    }

    this.updatePosition = function() {
        this.positionX += this.velocityX * dt;
        this.positionY += this.velocityY * dt;
        this.positionX = (this.positionX + canvas.width) % canvas.width
        this.positionY = (this.positionY + canvas.height) % canvas.height
    }

    this.draw = function() {
        c.beginPath();
        c.arc(this.positionX, this.positionY, 2, 0, 2 * Math.PI);
        c.fillStyle = `hsl(${360 * this.color / m}, 100%, 50%)`;
        c.fill();
    }
}
var particleArray = [];
for (let i = 0; i < n; i++) {
    particleArray.push(new Particle(Math.random() * canvas.width, 
                                    Math.random() * canvas.height, 
                                    0, 
                                    0, 
                                    Math.floor(Math.random() * m),
                                    i));
}

function force(r, a) {
    const beta = 0.3;
    if (r < beta) {
        return r / beta - 1;
    } else if (beta < r && r < 1) {
        return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
    } else {
        return 0;
    }
}
function fillGrid() {
    grid.clear();
    for (let i = 0; i < n; i++) {
        let wd = Math.floor(particleArray[i].positionX / rMax);
        let ht = Math.floor(particleArray[i].positionY / rMax);
        if (!grid.has(ht * w + wd)){
            grid.set(ht * w + wd, []);
        }
        var arr = grid.get(ht * w + wd);
        arr.push(i);
        grid.set(ht * w + wd, arr);
    }
}
fillGrid();
console.log(grid);
function loop() {
    
    // clear screen
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    // update velocity
    for (let i = 0; i < n; i++) {
        particleArray[i].updateVelocity();
    }
    //update position
    for (let i = 0; i < n; i++) {
        particleArray[i].updatePosition();
    }
    // draw
    for (let i = 0; i < n; i++) {
        particleArray[i].draw();
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);