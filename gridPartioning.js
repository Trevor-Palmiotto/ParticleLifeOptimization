var canvas = document.getElementById("myCanvas");
var d = 80;
canvas.width = Math.floor(innerWidth / d ) * d;
canvas.height = Math.floor(innerHeight / d) * d;
var c = canvas.getContext('2d');

var w = canvas.width / d;
var h = canvas.height / d;


var mouse = {
    x: undefined,
    y: undefined
}

window.addEventListener('click', 
    function(event){
        c.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < w*h; i++) {
            let wd = i % w;
            let ht = Math.floor(i / w);
            c.beginPath();
            c.rect(wd * d, ht * d, (wd + 1) * d, (ht+1) * d);
            c.stroke();
        }
        mouse.x = event.x;
        mouse.y = event.y;
        let wd = Math.floor(mouse.x / d);
        let ht = Math.floor(mouse.y / d);
        console.log([wd, ht]);
        c.beginPath();
        c.fillStyle = "red";
        c.fillRect(wd * d, ht * d, d, d);
        c.fill();
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
        console.log(Hs);
        console.log(Ws);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (Ws[i] == wd && Hs[j] == ht) continue;
                c.beginPath();
                c.fillStyle = 'green';
                c.fillRect(Ws[i] * d, Hs[j] * d, d, d);
                c.fill();
                c.beginPath();
                c.rect(Ws[i] * d, Hs[j] * d, d, d);
                c.stroke();
            }
        }
        var NN = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                NN.push(Hs[i] * w + Ws[j]);
            }
        }
        console.log(NN);
});

function loop(){
    // c.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < w*h; i++) {
        let wd = i % w;
        let ht = Math.floor(i / w);
        c.beginPath();
        c.rect(wd * d, ht * d, (wd + 1) * d, (ht+1) * d);
        c.stroke();
    }
    // requestAnimationFrame(loop);
}
requestAnimationFrame(loop);