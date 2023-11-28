var slider = document.getElementById('slider');
var output = document.getElementById('val');
slider.oninput = function() {
    output.innerHTML = this.value;
}
var canvas = document.getElementById('myCanvas');
const rMax = 200;
// canvas height and width are multiples of rMax
canvas.width = Math.floor(innerWidth / rMax) * rMax;
canvas.height = Math.floor(innerHeight / rMax) * rMax;
var c = canvas.getContext('2d');
var boxDrawn = false; // for Draw Box checkbox
const d = 1; // unitless distance from the viewport of perspective

var w_;
var h_;
var l_; 
var numW;
var numH;
var numL;

// Set dimensions based on the new innerWidth and innerHeight
function reDim(){
    canvas.width = Math.floor(innerWidth / rMax) * rMax;
    canvas.height = Math.floor(innerHeight / rMax) * rMax;
    w_ = canvas.width;
    h_ = canvas.height;
    l_ = Math.min(w_, h_); // setting for more uniform 3D environment
    // Lattice dimensions
    numW = w_ / rMax;
    numH = h_ / rMax;
    numL = Math.min(numH, numW);
}
reDim();
console.log(numW);
console.log(numH);
console.log(numL);

// Slider info
slider.max = w_ * h_ * l_ / (rMax*rMax*rMax);
slider.value = slider.max / 2;
output.innerHTML = slider.value;

// point class
const Point = function(x, y, z) {this.x = x; this.y = y; this.z = z / Math.min(h_, w_) + d};
var boxPoints = [];
var boxEdges = [];
// updates box information
function updateBox() {
    boxPoints = [
        new Point(0, 0, 0),
        new Point(w_, 0, 0),
        new Point(w_, h_, 0),
        new Point(0, h_, 0),
        new Point(0, 0, l_),
        new Point(w_, 0, l_),
        new Point(w_, h_, l_),
        new Point(0, h_, l_),
    ];
    boxEdges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 5], [2, 6], [3, 7],
        [4, 5], [5, 6], [6, 7], [7, 4]
    ];
}
updateBox();
// draws box
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
// draws lattice
function drawLattice() {
    c.strokeStyle = 'red';
    c.fillStyle = 'red';    
    c.lineWidth = 0.5;
    for (let j = 0; j < numW + 1; j++) {
        for (let i = 0; i < numH + 1; i++) {
            for (let k = 0; k < numL + 1; k++) {
                var pointActual = new Point(w_ / numW * j, h_ / numH * i, l_ / numL * k)
                var pointW = new Point(w_ / numW * (j+1), h_ / numH * i, l_ / numL * k)
                var pointH = new Point(w_ / numW * j, h_ / numH * (i+1), l_ / numL * k)
                var pointL = new Point(w_ / numW * j, h_ / numH * i, l_ / numL * (k+1))
                // Drawing point - size scales based on z axis
                c.beginPath();
                c.arc(computeX(pointActual), computeY(pointActual), 2 * (1-(k/2/numL)**2), 0, 2 * Math.PI);
                c.fill();
                // draw horizontal lines
                if (j < numW){
                    c.beginPath();
                    c.moveTo(computeX(pointActual), computeY(pointActual));
                    c.lineTo(computeX(pointW), computeY(pointW));
                    c.stroke();
                }
                // draw vertical lines
                if (i < numH) {
                    c.beginPath();
                    c.moveTo(computeX(pointActual), computeY(pointActual));
                    c.lineTo(computeX(pointH), computeY(pointH));
                    c.stroke();
                }
                // draw extruding lines
                if (k < numL) {
                    c.beginPath();
                    c.moveTo(computeX(pointActual), computeY(pointActual));
                    c.lineTo(computeX(pointL), computeY(pointL));
                    c.stroke();
                }
            }
        }
    }
}
// scale x between -w and w
function scaleX(x) {
    return 2 * x - w_;
}
// scale y between -h and h
function scaleY(x) {
    return 2 * x - h_;
}
// Computes X position on canvas
function computeX(Point) {
    return (scaleX(Point.x) * d) / (2 * Point.z) + w_ * 0.5;
}
// Computes Y position on canvas
function computeY(Point) {
    return (scaleY(Point.y) * d) / (2 * Point.z) + h_ * 0.5;
}
function draw() {
    c.fillRect(0, 0, w_, h_);
    drawBox();
}
draw();

// draws lattice when checkbox is checked
window.addEventListener('click', function(){
    if (this.document.getElementById("showLatticeCheckBox").checked && !boxDrawn){
        drawLattice();
        boxDrawn = true;
    }
    else if (!this.document.getElementById("showLatticeCheckBox").checked){
        c.fillStyle = 'black';
        draw();
        boxDrawn = false;
    }
})
// updates dimensions based on resize
window.addEventListener('resize', function() {
    reDim();
    updateBox();
    draw();
    numW = w_ / rMax;
    numH = h_ / rMax;
    numL = Math.min(numH, numW);
    if(boxDrawn){
        drawLattice();
    }
})