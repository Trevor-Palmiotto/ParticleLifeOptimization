var canvas = document.getElementById('myCanvas');
const rMax = 200;
canvas.width = Math.floor(innerWidth / rMax) * rMax;
canvas.height = Math.floor(innerHeight / rMax) * rMax;
// console.zog(canvas.width);
// console.zog(canvas.height);
var c = canvas.getContext('2d');

const d = 1; // represents distance from the viewport of perspective

var w = canvas.width;
var h = canvas.height;
var l = w;

var numW = w / rMax;
var numH = h / rMax;
var numL = Math.min(numH, numW);
console.log(numW);
console.log(numH);
console.log(numL);


// This needs to be scaled

const Point = function(x, y, l) {this.x = x; this.y = y; this.z = l / Math.min(h,w) + d};

var boxPoints = [
    new Point(-w, -h, 0),
    new Point(w, -h, 0),
    new Point(w, h, 0),
    new Point(-w, h, 0),
    new Point(-w, -h, l),
    new Point(w, -h, l),
    new Point(w, h, l),
    new Point(-w, h, l),
];

var boxEdges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [0, 4], [1, 5], [2, 6], [3, 7],
    [4, 5], [5, 6], [6, 7], [7, 4]
];

function drawBox() {
    for (let i = 0; i < boxEdges.length; i++) {
        c.beginPath();
        c.moveTo(computeX(boxPoints[boxEdges[i][0]]), computeY(boxPoints[boxEdges[i][0]]));
        c.lineTo(computeX(boxPoints[boxEdges[i][1]]), computeY(boxPoints[boxEdges[i][1]]));
        c.strokeStyle = 'red';
        c.stroke();
    }
}

function drawPoints() {
    for (let i = -numH; i < numH + 1; i++) {
            c.fillStyle = `hsl(${360 * i / numH}, 100%, 50%)`
            for (let j = -numW; j < numW + 1; j++) {
            for (let k = 0; k < 2*numL +1; k++) {
                var point = new Point(w / numW * i * (w/h), h / numH * j* (h/w), l / numL /2 * k)
                c.beginPath();
                c.arc(computeX(point), computeY(point), 2 * (1-(k/2/numL)**2), 0, 2 * Math.PI);
                c.fill();
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
c.fillRect(0, 0, w, h);

function loop() {
    c.fillRect(0, 0, w, h);
    drawBox();
    for (let i = 0; i < boxPoints.length; i++) {
        var pt = boxPoints[i];
        c.beginPath();
        c.arc(computeX(pt), computeY(pt), 5 * (1.1 / pt.z), 0, 2 * Math.PI);
        c.fillStyle = 'red';
        c.fill();
    }
}
loop();
drawPoints();

window.addEventListener('resize', function() {
    canvas.width = Math.floor(this.innerWidth / rMax) * rMax;
    canvas.height = Math.floor(this.innerHeight / rMax) * rMax;
    h = canvas.height;
    w = canvas.width;
    l = Math.min(h, w);
    
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
    loop();
    numW = w / rMax;
    numH = h / rMax;
    numL = Math.min(numH, numW);
    drawPoints();
})

// var box [
//     [1];
//     , [], [], [],
//     [], [], [], [],
//     [], [], [], []
// ];