var canvas = document.getElementById('myCanvas');
// the maximum distance at which particles acts on each other
const dMax = 200;
// Important for lattice partitioning
canvas.height = Math.floor(innerHeight / dMax) * dMax;
canvas.width = Math.floor(innerWidth / dMax) * dMax;
var c = canvas.getContext('2d');
// arbitrary distance from the viewport used for 3D scaling
const d = 1;
// holds positions for lattice partitioning
var subLattice = [];
// lattice dimensions for height, width, and length
var hDim;
var wDim;
var lDim;
// height, width, and length pixels
var h;
var w;
var l;
// dimension neighbor arrays
var hNbr = [];
var wNbr = [];
var lNbr = [];
// resets dimensions based on new window size
function reDim() {
    canvas.height = Math.floor(innerHeight / dMax) * dMax;
    canvas.width = Math.floor(innerWidth / dMax) * dMax;
    h = canvas.height;
    w = canvas.width;
    // enforces a more uniform shape
    l = Math.min(h, w);
    hDim = h / dMax;
    wDim = w / dMax;
    lDim = l / dMax;
}
reDim();
// number of particles - density of 1 particle per 100 cubic pixels
const n = h*w*l / (100**3);
// environment parameters
const dt = 0.02;
const frictionHalfLife = 0.040;
const particleTypeCount = 6;
var matrix = makeRandomMatrix();
var lattice = new Map();
const frictionFactor = Math.pow(0.5, dt / frictionHalfLife);
const forceFactor = 3;
// returns random attraction matrix where -1 < values < 1
function makeRandomMatrix() {
    const rows = [];
    for (let i = 0; i < particleTypeCount; i++) {
        const row = [];
        for (let j = 0; j < particleTypeCount; j++) {
            row.push(Math.random() * 2 - 1); 
        }
        rows.push(row);
    }
    return rows;
}
// filling particle array
var particleArray = [];
for (let i = 0; i < n; i++) {
    particleArray.push(new Particle(Math.random()*w,
                                    Math.random()*h,
                                    Math.random()*l,
                                    0,0,0,
                                    Math.floor(Math.random()*particleTypeCount),
                                    i));
}
// returns lattice key
function computeLatticeIndex(ht, wd, len) {
    return ht*wDim + wd + len*hDim*wDim;
}
// fills lattice with particles based on their scaled lattice position
function fillLattice() {
    lattice.clear();
    for (let i = 0; i < n; i++) {
        let p = particleArray[i];
        let ht = Math.floor(p.posY / dMax);
        let wd = Math.floor(p.posX / dMax);
        let len = Math.floor(p.posZ / dMax);
        let index = computeLatticeIndex(ht, wd, len)
        if (!lattice.has(index)) {lattice.set(index, []);}
        var indexArr = lattice.get(index);
        indexArr.push(i);
    }
}
// particle class
function Particle(posX, posY, posZ, velX, velY, velZ, color, index) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.velX = velX;
    this.velY = velY;
    this.velZ = velZ;
    this.color = color;
    this.index = index;
}
// update velocity based on force
function updateVelocities(){
    // for each particle
    for (let i = 0; i < n; i++) {
        let totalForceX = 0;
        let totalForceY = 0;
        let totalForceZ = 0;
        let pt = particleArray[i];
        var latticeCubeNbrs = latticeCubeNeighbors(Math.floor(pt.posY / dMax), 
                                                   Math.floor(pt.posX / dMax),
                                                   Math.floor(pt.posZ / dMax));
        // for each neighboring cube
        for (let j = 0, nbrs = latticeCubeNbrs.length; j < nbrs; j++) {
            if (lattice.has(latticeCubeNbrs[j])) {
                var nbrCubeParticlesIndices = lattice.get(latticeCubeNbrs[j]);
                // for each particle in neighboring cube
                for (let k = 0, nbrParticles = nbrCubeParticlesIndices.length; k < nbrParticles; k++) {
                    let ptNbr = particleArray[nbrCubeParticlesIndices[k]];
                    if (ptNbr.index === pt.index) continue;
                    // dimension distances
                    let dx = ptNbr.posX - pt.posX;
                    let dy = ptNbr.posY - pt.posY;
                    let dz = ptNbr.posZ - pt.posZ;
                    // checks for closest distance, flips sign if other direction is closer
                    if (Math.abs(dx) > w/2) {
                        dx = (w-Math.abs(dx)) * -dx/Math.abs(dx);
                    }
                    if (Math.abs(dy) > h/2) {
                        dy = (h-Math.abs(dy)) * -dy/Math.abs(dy);
                    }
                    if (Math.abs(dz) > l/2) {
                        dz = (l-Math.abs(dz)) * -dz/Math.abs(dz);
                    }
                    
                    /* possible optimization here for computing entire neighboring cubes against each other
                    (every action has equal and opposite reaction) - would halve computation? ~
                    it would require storing a totalForce x/y/z for each particle and checks to prevent
                    neighboring cube forces recomputations - very long boolean array */
                    
                    // computing force of neighboring particle on this particle
                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (dist > 0 && dist < dMax) {
                        const f = force(dist / dMax, matrix[pt.color][ptNbr.color]);
                        totalForceX += dx / dist * f;
                        totalForceY += dy / dist * f;
                        totalForceZ += dz / dist * f;
                    }
                }
            }
        }
        // scaling back to pixel dimensions
        totalForceX *= dMax * forceFactor;
        totalForceY *= dMax * forceFactor;
        totalForceZ *= dMax * forceFactor;
        // velocity friction update
        pt.velX *= frictionFactor;
        pt.velY *= frictionFactor;
        pt.velZ *= frictionFactor;
        // velocity force update
        pt.velX += totalForceX * dt;
        pt.velY += totalForceY * dt;
        pt.velZ += totalForceZ * dt;
    } 
}
// update position based on velocity
function updatePositions(){
    for (let i = 0; i < n; i++) {
        let pt = particleArray[i];
        // position velocity update
        pt.posX += pt.velX * dt;
        pt.posY += pt.velY * dt;
        pt.posZ += pt.velZ * dt;
        // position wrapping update
        pt.posX = (pt.posX + w) % w;
        pt.posY = (pt.posY + h) % h;
        pt.posZ = (pt.posZ + l) % l;
    }
}
// returns force of one particle on another
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
// returns neighboring scaled values of scaled d based on lattice scaled total dDim
function dimensionNeighbors(d, dDim) {
    return [
        (d + dDim - 1) % dDim,
        (d + dDim) % dDim,
        (d + dDim + 1) % dDim
    ];
}
// returns the indices of neighboring cubes given ht, wd, and len
function latticeCubeNeighbors(ht, wd, len) {
    hNbr = dimensionNeighbors(ht, hDim);
    wNbr = dimensionNeighbors(wd, wDim);
    lNbr = dimensionNeighbors(len, lDim);
    var arr = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                arr.push(computeLatticeIndex(hNbr[j], wNbr[k], lNbr[i]));
            }
        }
    }
    return arr;
}

// returns value of point x or y on screen
function xyToScreen(x, y, z) {
    return [
        d * (2*x - w) / (2*(z / l + d)) + w/2,
        d * (2*y - h) / (2*(z / l + d)) + h/2
    ];
}

// box visualization
// point class
const Point = function(x, y, z) {this.x = x; this.y = y; this.z = z};
var boxPoints = [];
var boxEdges = [];
// updates box information
function updateBox() {
    boxPoints = [
        new Point(0, 0, 0),
        new Point(w, 0, 0),
        new Point(w, h, 0),
        new Point(0, h, 0),
        new Point(0, 0, l),
        new Point(w, 0, l),
        new Point(w, h, l),
        new Point(0, h, l),
    ];
    boxEdges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 5], [2, 6], [3, 7],
        [4, 5], [5, 6], [6, 7], [7, 4]
    ];
}
// draws box
function drawBox() {
    updateBox();
    c.strokeStyle = 'white';
    for (let i = 0; i < boxEdges.length; i++) {
        var ptA = xyToScreen(boxPoints[boxEdges[i][0]].x, boxPoints[boxEdges[i][0]].y, boxPoints[boxEdges[i][0]].z);
        var ptB = xyToScreen(boxPoints[boxEdges[i][1]].x, boxPoints[boxEdges[i][1]].y, boxPoints[boxEdges[i][1]].z);
        c.lineWidth = 1/(1+(2-i%4));
        c.beginPath();
        c.moveTo(ptA[0], ptA[1]);
        c.lineTo(ptB[0], ptB[1]);
        c.stroke();
    }
}
// stores indices of particles in particleArray sorted by z
var zSort = [];
// recursive draw onto canvas
function draw() {
    fillLattice();
    updateVelocities();
    updatePositions();
    c.fillStyle = "black";
    c.fillRect(0, 0, w, h);
    drawBox();
    zSort = [];
    for (let i = 0; i < n; i++) {
        zSort.push({z: particleArray[i].posZ, index: i});    
    }
    zSort.sort((a, b) => {return a.z - b.z});
    
    for (let i = 0; i < n; i++) {
        let pt = particleArray[zSort[i].index];
        var screenPos = xyToScreen(pt.posX, pt.posY, pt.posZ);
        c.beginPath();
        c.arc(screenPos[0], screenPos[1], 2*(1-pt.posZ/l), 0, 2 * Math.PI);
        c.fillStyle = `hsl(${360 * pt.color / particleTypeCount}, 100%, 50%)`;
        c.fill();
    }

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
// events
window.addEventListener('click', function(){
    matrix = makeRandomMatrix();
});
window.addEventListener('resize', function() {
    reDim();
})