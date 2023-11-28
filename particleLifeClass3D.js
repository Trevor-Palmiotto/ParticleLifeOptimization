var canvas = document.getElementById('myCanvas');
const rMax = 100; // Remember for +/- this becomes half
canvas.width = Math.floor(innerWidth / rMax) * rMax;
canvas.height = Math.floor(innerHeight / rMax) * rMax;
var c = canvas.getContext('2d');
var boxDrawn = false;
const d = 1; // distance from the viewport of perspective

var w_;
var h_;
var l_; 
var numW;
var numH;
var numL;
function reDim(){
    canvas.width = Math.floor(innerWidth / rMax) * rMax;
    canvas.height = Math.floor(innerHeight / rMax) * rMax;
    w_ = canvas.width;
    h_ = canvas.height;
    l_ = Math.min(w_, h_);
    numW = w_ / rMax;
    numH = h_ / rMax;
    numL = Math.min(numH, numW);

}
reDim();
console.log(numW);
console.log(numH);
const Point = function(x, y, z) {this.x = x; this.y = y; this.z = z / Math.min(h_, w_) + d};
var boxPoints = [];
var boxEdges = [];
function updateBox() {
    boxPoints = [
        new Point(-w_, -h_, 0),
        new Point(w_, -h_, 0),
        new Point(w_, h_, 0),
        new Point(-w_, h_, 0),
        new Point(-w_, -h_, l_),
        new Point(w_, -h_, l_),
        new Point(w_, h_, l_),
        new Point(-w_, h_, l_),
    ];
    boxEdges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 5], [2, 6], [3, 7],
        [4, 5], [5, 6], [6, 7], [7, 4]
    ];
}
updateBox();
function drawBox() {
    c.strokeStyle = 'white';
    c.lineWidth = 1;
    for (let i = 0; i < boxEdges.length; i++) {
        c.beginPath();
        c.moveTo(computeX(boxPoints[boxEdges[i][0]]), computeY(boxPoints[boxEdges[i][0]]));
        c.lineTo(computeX(boxPoints[boxEdges[i][1]]), computeY(boxPoints[boxEdges[i][1]]));
        c.stroke();
    }
}
function drawGridBox() {
    c.strokeStyle = 'red';
    c.fillStyle = 'red';    
    c.lineWidth = 0.25;
    for (let j = -numW; j < numW + 1; j+=2) {
        for (let i = -numH; i < numH + 1; i+=2) {
            for (let k = 0; k < 2 * numL + 1; k+=2) {
                var pointActual = new Point(w_ / numW * j, h_ / numH * i, l_ / numL / 2 * k)
                var pointW = new Point(w_ / numW * (j+2), h_ / numH * i, l_ / numL / 2 * (k))
                var pointH = new Point(w_ / numW * j, h_ / numH * (i+2), l_ / numL / 2 * (k))
                var pointL = new Point(w_ / numW * j, h_ / numH * i, l_ / numL / 2 * (k+2))
                // Drawing point
                c.beginPath();
                c.arc(computeX(pointActual), computeY(pointActual), 2 * (1-(k/2/numL)**2), 0, 2 * Math.PI);
                c.fill();
                // Drawing lines
                if (j < numW && i - 1 < numH){
                    c.beginPath();
                    c.moveTo(computeX(pointActual), computeY(pointActual));
                    c.lineTo(computeX(pointW), computeY(pointW));
                    c.stroke();
                }
                if (i < numH && j - 1 < numW) {
                    c.beginPath();
                    c.moveTo(computeX(pointActual), computeY(pointActual));
                    c.lineTo(computeX(pointH), computeY(pointH));
                    c.stroke();
                }
                if (k + 1 < 2 * numL+1 ) {
                    c.beginPath();
                    c.moveTo(computeX(pointActual), computeY(pointActual));
                    c.lineTo(computeX(pointL), computeY(pointL));
                    c.stroke();                  
                }
            }
        }
    }
}
function computeX(Point) {
    return (Point.x * d) / (2 * Point.z) + w_ / 2;
}
function computeY(Point) {
    return (Point.y * d) / (2 * Point.z) + h_ / 2;
}
function draw() {
    c.fillRect(0, 0, w_, h_);
    drawBox();
    for (let i = 0; i < boxPoints.length; i++) {
        var pt = boxPoints[i];
        c.beginPath();
        c.arc(computeX(pt), computeY(pt), 1, 0, 2 * Math.PI);
        c.fillStyle = 'white';
        c.fill();
    }
}
draw();

window.addEventListener('click', function(){
    if (this.document.getElementById("showGridCheckBox").checked && !boxDrawn){
        drawGridBox();
        boxDrawn = true;
    }
    else if (!this.document.getElementById("showGridCheckBox").checked){
        c.fillStyle = 'black';
        draw();
        boxDrawn = false;
    }
})
window.addEventListener('resize', function() {
    reDim();
    updateBox();
    draw();
    numW = w_ / rMax;
    numH = h_ / rMax;
    numL = Math.min(numH, numW);
    if (boxDrawn) {
        drawGridBox();
   }
   redimParticleArray();
   fillGrid();
})

// Sticking with object oriented approach
const n = w_ * h_ / (1000); // creates a density of 1 particle per 10 square
console.log(h_);
console.log(w_);
console.log(n);
const dt = 0.02; // Change to 1/60 to match hertz
const frictionHalfLife = 0.040;
const m = 6; // num colors
var matrix = makeRandomMatrix(); // attraction matrix
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
    var Hs = [
        ((ht - 1) + numH) % numH,
        ((ht) + numH) % numH,
        ((ht + 1) + numH) % numH
    ];
    var Ws = [
        ((wd - 1) + numW) % numW,
        ((wd) + numW) % numW,
        ((wd + 1) + numW) % numW
    ];
    var NN = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            NN.push(Hs[i] * numW + Ws[j]);
        }
    }
    return NN;
}
window.addEventListener("click", function() {
    matrix = makeRandomMatrix();
})

function Particle(positionX, positionY, positionZ, velocityX, velocityY, velocityZ, color, index) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.positionZ = positionZ;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.velocityZ = velocityZ;
    this.color = color;
    this.index = index;

    this.updateVelocity = function() {
        let totalForceX = 0;
        let totalForceY = 0;
        var NNs = getNearestNeighbors(Math.floor(this.positionX / rMax), Math.floor(this.positionY / rMax));
        for (let i = 0; i < NNs.length; i++){
            if (grid.has(NNs[i])) {
                var pArray = grid.get(NNs[i]);
                pArray.forEach(p => {
                    if (p === this.index) return;
                    var rx = particleArray[p].positionX - this.positionX;
                    var ry = particleArray[p].positionY - this.positionY;

                    if (Math.abs(rx) > (canvas.width / 2)) {
                        rx = (canvas.width - Math.abs(rx)) * -rx / Math.abs(rx);
                    }
                    if (Math.abs(ry) > (canvas.height / 2)) {
                        ry = (canvas.height - Math.abs(ry)) * -ry / Math.abs(ry);
                    }
                    const r = Math.hypot(rx, ry);
                    if (r < 0) {
                        console.log(r);
                    }
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
        this.positionX = (this.positionX + w_) % w_;
        this.positionY = (this.positionY + h_) % h_;
    }

    this.draw = function() {
        c.beginPath();
        c.arc(this.positionX, this.positionY, 2, 0, 2 * Math.PI);
        c.fillStyle = `hsl(${360 * this.color / m}, 100%, 50%)`;
        c.fill();
    }
}

var particleArray = [];
function redimParticleArray() {
    particleArray = [];
    for (let i = 0; i < n; i++) {
        particleArray.push(new Particle(Math.random() * w_, 
                                        Math.random() * h_, 
                                        Math.random() * l_, 
                                        0, 
                                        0, 
                                        0, 
                                        Math.floor(Math.random() * m),
                                        i));
    }
}
redimParticleArray();
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
        if (!grid.has(ht * numW + wd)){
            grid.set(ht * numW + wd, []);
        }
        var arr = grid.get(ht * numW + wd);
        arr.push(i);
        grid.set(ht * numW + wd, arr);
    }
}
// console.log(grid);
function loop() {
    fillGrid();
    // clear screen
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    draw();
    if (boxDrawn) {
        drawGridBox();
    }
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
// requestAnimationFrame(loop);