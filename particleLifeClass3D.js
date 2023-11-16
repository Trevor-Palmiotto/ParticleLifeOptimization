var canvas = document.getElementById('myCanvas');
const rMax = 400; // Remember for +/- this becomes half
canvas.width = Math.floor(innerWidth / rMax) * rMax;
canvas.height = Math.floor(innerHeight / rMax) * rMax;
var c = canvas.getContext('2d');
var boxDrawn = false;
const d = 1; // represents distance from the viewport of perspective

var w;
var h;
var l; 
var numW;
var numH;
var numL;

function reDim(){
    canvas.width = Math.floor(innerWidth / rMax) * rMax;
    canvas.height = Math.floor(innerHeight / rMax) * rMax;
    w = canvas.width;
    h = canvas.height;
    l = Math.min(w, h);
    numW = w / rMax;
    numH = h / rMax;
    numL = Math.min(numH, numW);

}
reDim();
console.log(numW);
console.log(numH);
console.log(numL);


const Point = function(x, y, l) {this.x = x; this.y = y; this.z = l / Math.min(h,w) + d};
var boxPoints = [];
var boxEdges = [];
function updateBox() {
    boxPoints = [
        new Point(-w, -h, 0),
        new Point(w, -h, 0),
        new Point(w, h, 0),
        new Point(-w, h, 0),
        new Point(-w, -h, l),
        new Point(w, -h, l),
        new Point(w, h, l),
        new Point(-w, h, l),
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
// Something not working here
function drawGridBox() {
    // These need to be separated somehow. Height should not be dependent on width etc. This seems to happen, what's going on?
    c.strokeStyle = 'red';
    c.fillStyle = 'red';    
    c.lineWidth = 0.25;
    for (let j = -numW; j < numW + 1; j++) {
        for (let i = -numH; i < numH + 1; i++) {
            for (let k = 0; k < 2 * numL + 1; k++) {
                var pointActual = new Point(w / numW * j, h / numH * i, l / numL / 2 * k)
                var pointW = new Point(w / numW * (j+1), h / numH * i, l / numL / 2 * (k))
                var pointH = new Point(w / numW * j, h / numH * (i+1), l / numL / 2 * (k))
                var pointL = new Point(w / numW * j, h / numH * i, l / numL / 2 * (k+1))

                c.beginPath();
                c.arc(computeX(pointActual), computeY(pointActual), 2 * (1-(k/2/numL)**2), 0, 2 * Math.PI);
                c.fill();
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
    return (Point.x * d) / (2 * Point.z) + w / 2;
}
function computeY(Point) {
    return (Point.y * d) / (2 * Point.z) + h / 2;
}

function draw() {
    c.fillRect(0, 0, w, h);
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
        drawGridBox();

// window.addEventListener('click', function(){
//     if (this.document.getElementById("showGridCheckBox").checked && !boxDrawn){
//         drawGridBox();
//         boxDrawn = true;
//     }
//     else if (!this.document.getElementById("showGridCheckBox").checked){
//         c.fillStyle = 'black';
//         draw();
//         boxDrawn = false;
//     }
// })
window.addEventListener('resize', function() {
    reDim();
    updateBox();
    draw();
    numW = w / rMax;
    numH = h / rMax;
    numL = Math.min(numH, numW);
    drawGridBox();
})