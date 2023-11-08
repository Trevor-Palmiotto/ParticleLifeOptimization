var canvas = document.getElementById('myCanvas');
canvas.width = Math.floor(innerWidth / 80) * 80;
canvas.height = Math.floor(innerHeight / 80) * 80;
console.log(canvas.width);
console.log(canvas.height);
var c = canvas.getContext('2d');

const n = 1000;
const dt = 0.02;
const frictionHalfLife = 0.040;
const rMax = 80;
const m = 6;
const matrix = makeRandomMatrix();
const forceFactor = 10;

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

        for (let i = 0; i < n; i++) {
            if (i === this.index) continue;
            
            var rx = particleArray[i].positionX - this.positionX;
            var ry = particleArray[i].positionY - this.positionY;
            if (Math.abs(rx) > (canvas.width / 2)) {
                rx = (canvas.width - Math.abs(rx)) * -rx / Math.abs(rx);
            }
            if (Math.abs(ry) > (canvas.height / 2)) {
                ry = (canvas.height - Math.abs(ry)) * -ry / Math.abs(ry);
            }
            const r = Math.hypot(rx, ry);
            if (r > 0 && r < rMax) {
                const f = force(r / rMax, matrix[this.color][particleArray[i].color]);
                totalForceX += rx / r * f;
                totalForceY += ry / r * f;
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
        if (this.positionX > canvas.width) {this.positionX = 0;}
        if (this.positionX < 0) {this.positionX = canvas.width;}
        if (this.positionY > canvas.height) {this.positionY = 0;}
        if (this.positionY < 0) {this.positionY = canvas.height;}
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