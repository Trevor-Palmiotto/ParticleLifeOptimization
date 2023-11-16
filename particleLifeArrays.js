var canvas = document.getElementById('myCanvas');
const rMax = 0.4;
canvas.width = innerWidth;
canvas.height = innerHeight;
var c = canvas.getContext('2d');

const n = 1000;
const dt = 0.02;
const frictionHalfLife = 0.040;
const m = 6;
const matrix = makeRandomMatrix();
const forceFactor = 5;

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

const colors = new Int32Array(n);
const positionsX = new Float32Array(n);
const positionsY = new Float32Array(n);
const positionsZ = new Float32Array(n);
const velocitiesX = new Float32Array(n);
const velocitiesY = new Float32Array(n);
const velocitiesZ = new Float32Array(n);
for (let i = 0; i < n; i++) {
    colors[i] = Math.floor(Math.random() * m);
    positionsX[i] = Math.random() * 2 - 1;
    positionsY[i] = Math.random() * 2 - 1;
    positionsZ[i] = Math.random() * 2 - 1;
    // positionsX[i] = Math.random() - 0.5;
    // positionsY[i] = Math.random() - 0.5;
    // positionsZ[i] = Math.random() - 0.5;
    velocitiesX[i] = 0;
    velocitiesY[i] = 0;
    velocitiesZ[i] = 0;
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

function updateParticles() {
    // update velocities
    for (let i = 0; i < n; i++) {
        let totalForceX = 0;
        let totalForceY = 0;
        let totalForceZ = 0;

        for (let j = 0; j < n; j++) {
            if (j === i) continue;
            
            var rx = positionsX[j] - positionsX[i];
            var ry = positionsY[j] - positionsY[i];
            var rz = positionsZ[j] - positionsZ[i];
            if (Math.abs(rx) > 1) {
                rx = (2 - Math.abs(rx)) * -rx / Math.abs(rx);
            }
            if (Math.abs(ry) > 1) {
                ry = (2 - Math.abs(ry)) * -ry / Math.abs(ry);
            }
            if (Math.abs(rz) > 1) {
                rz = (2 - Math.abs(rz)) * -rz / Math.abs(rz);
            }
            const r = Math.sqrt(rx*rx + ry*ry + rz*rz);
            if (r > 0 && r < rMax) {
                const f = force(r / rMax, matrix[colors[i]][colors[j]]);
                totalForceX += rx / r * f;
                totalForceY += ry / r * f;
                totalForceZ += rz / r * f;
            }
        }

        totalForceX *= rMax * forceFactor;
        totalForceY *= rMax * forceFactor;
        totalForceZ *= rMax * forceFactor;
        // totalForceX *= rMax * forceFactor/2;
        // totalForceY *= rMax * forceFactor/2;
        // totalForceZ *= rMax * forceFactor/2;

        velocitiesX[i] *= frictionFactor;
        velocitiesY[i] *= frictionFactor;
        velocitiesZ[i] *= frictionFactor;
        // velocitiesX[i] *= frictionFactor / 2;
        // velocitiesY[i] *= frictionFactor / 2;
        // velocitiesZ[i] *= frictionFactor / 2;

        velocitiesX[i] += totalForceX * dt;
        velocitiesY[i] += totalForceY * dt;
        velocitiesZ[i] += totalForceZ * dt;
        // velocitiesX[i] += totalForceX * dt/2;
        // velocitiesY[i] += totalForceY * dt/2;
        // velocitiesZ[i] += totalForceZ * dt/2;
    }

    //update positions
    for (let i = 0; i < n; i++) {
        positionsX[i] += velocitiesX[i] * dt;
        positionsY[i] += velocitiesY[i] * dt;
        positionsZ[i] += velocitiesZ[i] * dt;
        positionsX[i] = ((Math.abs(positionsX[i]) + 1) % 2 - 1) * positionsX[i] / Math.abs(positionsX[i])
        positionsY[i] = ((Math.abs(positionsY[i]) + 1) % 2 - 1) * positionsY[i] / Math.abs(positionsY[i])
        positionsZ[i] = ((Math.abs(positionsZ[i]) + 1) % 2 - 1) * positionsZ[i] / Math.abs(positionsZ[i])
    }
}

function loop() {
    // update particles
    updateParticles();

    // draw particles
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    c.moveTo(0, canvas.height);
    c.lineTo(canvas.width/3, canvas.height*2/3);
    c.strokeStyle = 'white';
    c.lineTo(canvas.width*2/3, canvas.height*2/3)
    c.lineTo(canvas.width*2/3, canvas.height/3);
    c.lineTo(canvas.width/3, canvas.height/3);
    c.lineTo(canvas.width/3, canvas.height*2/3);
    c.stroke();
    c.beginPath();
    c.moveTo(0,0);
    c.lineTo(canvas.width/3, canvas.height/3);
    c.stroke();
    c.beginPath();
    c.moveTo(canvas.width,0);
    c.lineTo(canvas.width*2/3, canvas.height/3);
    c.stroke();
    c.beginPath();
    c.moveTo(canvas.width,canvas.height);
    c.lineTo(canvas.width*2/3, canvas.height*2/3);
    c.stroke();
    for (let i = 0; i < n; i++) {

        c.beginPath();
        const f = 1 / (positionsZ[i] + 2)
        const screenX = (f * positionsX[i] + 1) * 0.5 * canvas.width;        
        const screenY = (f * positionsY[i] + 1) * 0.5 * canvas.height;
        // const f = 1 / (positionsZ[i] + 1)
        // const screenX = (f * positionsX[i] + 1) * 0.5 * canvas.width;        
        // const screenY = (f * positionsY[i] + 1) * 0.5 * canvas.height;
        c.arc(screenX, screenY, 2 * (1 - ((positionsZ[i] + 0.67) * 0.5)), 0, 2 * Math.PI);
        c.fillStyle = `hsl(${360 * (colors[i] / m)}, 100%, 50%)`;
        c.fill();


    }

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);