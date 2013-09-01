var mirror = CodeMirror.fromTextArea(document.getElementById('code'), {
    mode: 'javascript'
});

var tid;
var fid;
var canvas = document.getElementById('c');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var wrap = document.getElementById('wrap');
var ctx = canvas.getContext('2d');
var r2d = Math.PI / 180;

ctx.strokeStyle = '#000';
ctx.lineWidth = 1;

var pos = center();

function center() {
    return [window.innerWidth / 2, window.innerHeight / 2];
}

mirror.on('change', onchange);
mirror.on('keydown', sustain);

function turtle(_decide) {
    decides = [_decide];
}

function onchange() {
    sustain();
    try {
        eval(mirror.getValue());
        _run();
    } catch (e) { }
}

document.onmousemove = sustain;

function _run() {
    var step = 0;
    var pos = [center()];
    clear();
    if (tid !== undefined) window.clearInterval(tid);
    tid = window.setInterval(tick, 10);

    function tick() {
        if (++step > 30000) window.clearInterval(tid);
        decides.some(function(dec, i) {
            var angle = dec(step);
            if (Array.isArray(angle)) {
                var cp = pos[i].slice();
                decides = decides.filter(function(d, i) {
                    pos.splice(i, 1);
                    return dec !== d;
                }).concat(angle);
                for (var j = 0; j < angle.length; j++) pos.push(cp.slice());
                return true;
            }
            ctx.beginPath();
            ctx.moveTo(pos[i][0], pos[i][1]);
            pos[i][0] += Math.cos(r2d * angle);
            pos[i][1] += Math.sin(r2d * angle);
            ctx.lineTo(pos[i][0], pos[i][1]);
            ctx.stroke();
        });
        // if (step % 10 === 0) over();
    }
}

function clear() {
    canvas.width = canvas.width;
}

function over() {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.01;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
}

function sustain() {
    wrap.className = '';
    queuefade();
}

function queuefade() {
    if (fid) clearTimeout(fid);
    fid = setTimeout(fade, 2000);
}

function fade() {
    wrap.className = 'hide';
}

queuefade();

if (location.hash) {
    var id = location.hash.substring(1);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/gists/' + id);
    xhr.onload = function() {
        var son = JSON.parse(this.responseText);
        mirror.setValue(son.files['turtle.js'].content);
    };
    xhr.send();
}
