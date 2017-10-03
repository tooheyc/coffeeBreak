function initialize() {
    const starting = 'decaf', bannerBuffer = 100;
    const moods = ['decaf', 'mocha', 'espresso'];
    setMood.width = window.innerWidth;
    // Leaving 100px above graphics for text.
    setMood.height = window.innerHeight - bannerBuffer;

    var backGround = document.getElementById('myCanvas');
    backGround.width = setMood.width;
    backGround.height = setMood.height;

    document.getElementById('restartButton').addEventListener("click", restart);

    for (var i in moods) {
        (function (i) {
            document.getElementById(moods[i]).addEventListener("click", function () {
                moodSwing(document.getElementById(moods[i]));
            });

        })(i);
    }

    document.getElementById('stop').addEventListener("click", stopGo);

    createBalls();

    // Starting mood.
    moodSwing(document.getElementById(starting));
}

var setMood = {
    // Set preferences, then call setFactors to reinitialize the balls.
    bounceBalls: [], // Array of intervals for moving the balls.
    balls: [], // Array of balls.
    width: 0,  // Window width
    height: 0, // Window height
    faded: [], // Array of balls to fade in/out.
    fadeInterval: [], // Array of intervals for fading the balls
    running: '', // currently running "mood"
    byte: 256, // 8 bits holds 256 values.
    seconds: 3.5 * 1000, // Used by setInterval
    maxFade: 8, // Largest number of balls where fading in/out can be used.

    // Must call deleteLayers to remove old layers before resetting the ballCount.
    decaf: function () {
        deleteLayers();
        this.speedFactor = 0.25;
        this.ballSize = 12;
        this.opacity = .25;
        this.ballCount = 7;
        this.background = 'rgb(227, 224, 220)';
        this.running = 'decaf';
        this.setFactors();
    },

    mocha: function () {
        deleteLayers();
        this.speedFactor = 0.6;
        this.ballSize = 8;
        this.opacity = .7;
        this.ballCount = 10;
        this.background = 'rgb(214, 208, 199)';
        this.running = 'mocha';
        this.setFactors();
    },

    espresso: function () {
        deleteLayers();
        this.speedFactor = 1.5;
        this.ballSize = 4;
        this.opacity = 1;
        this.ballCount = 17;
        this.background = 'rgb(201, 192, 177)';
        this.running = 'espresso';
        this.setFactors();
    },

    setFactors: function () {
        document.getElementById('myCanvas').style.backgroundColor = this.background;
        this.balls = [];
        createBalls();
        createLayers();
        // Call moveBalls so that even when the movements have been stopped
        // the screen will show the new balls.
        moveBalls();
    }

};

// Balls are initialized with random x & y coordinates, radius, color, and speed.
function createBalls() {
    const minDistEdge = 15, speedDir = 10, speedFactor = 10, initRadius = 20, minSpeed = 4, minSize = 5;

    for (var i = 0; i < setMood.ballCount; i++) {
        var radius = Math.floor(getRandomInt(initRadius) + minSize * setMood.ballSize);
        var px = getRandomInt(setMood.width - 2 * (radius + minDistEdge)) + radius + minDistEdge;
        var py = getRandomInt(setMood.height - 2 * (radius + minDistEdge)) + radius + minDistEdge;
        var cl = 'rgb(' + getRandomInt(setMood.byte) + ',' + getRandomInt(setMood.byte) + ',' + getRandomInt(setMood.byte) + ')';

        // Set speed: first set positive/negative for direction, then choose random speed & multiply by factor.
        var speedX = (getRandomInt(speedDir) % 2 ? -1 : 1) * (getRandomInt(speedFactor) + minSpeed) * setMood.speedFactor;
        var speedY = (getRandomInt(speedDir) % 2 ? -1 : 1) * (getRandomInt(speedFactor) + minSpeed) * setMood.speedFactor;
        setMood.balls.push(new ball(px, py, radius, cl, speedX, speedY));
    }

    // First clear old interval(s), then create a new one.
    while (setMood.fadeInterval.length) {
        clearInterval(setMood.fadeInterval.pop());
    }
    if (setMood.ballCount < setMood.maxFade) setMood.fadeInterval = [setInterval(fadeBalls, setMood.seconds)];

    while (setMood.bounceBalls.length) {
        clearInterval(setMood.bounceBalls.pop());
    }
    if (document.getElementById('stop').innerHTML == "STOP") setMood.bounceBalls = [setInterval(moveBalls, 30)];
}

// Create layers to hold the balls, which can have varying levels of opacity.
function createLayers() {
    var parentDiv = document.getElementById('background');
    for (var i in setMood.balls) {
        var id = "myCanvas_" + i, canDiv = "canvasDiv" + i;
        setMood.balls[i].setCanvas(id, canDiv);
        var myDiv = document.createElement('div');
        myDiv.setAttribute('id', 'canvasDiv' + i);
        myDiv.style.cssText = "transition: 1.5s; position: absolute; left: 0; top: 0; z-index: " + i + "; opacity: " + setMood.opacity + ";";
        myDiv.innerHTML = '<canvas id="' + id + '" width="' + setMood.width + '" height="' + setMood.height + '"> Your browser does not support the canvas element. </canvas>';
        parentDiv.appendChild(myDiv);
    }
}

function moveBalls() {
    for (var i in setMood.balls) {
        setMood.balls[i].move();
    }
}

function moodSwing(obj) {
    var ids = ['decaf', 'mocha', 'espresso'];
    // Button has been clicked. Let's give visual feedback.
    obj.className += " selectedButton";
    var objId = obj.id;

    // The mood is set by several preference variables.
    setMood[objId]();

    // Set not clicked buttons to no longer be selected.
    for (var i in ids) {
        if (obj.id != ids[i]) {
            document.getElementById(ids[i]).className = "coffeeButton coffeeHover";
        }
    }
}

var sizeChange;
window.onresize = function () {
    clearTimeout(sizeChange);
    sizeChange = setTimeout(setCanvasSize, 100);
};

// Force graphics to fit in the window.
function setCanvasSize() {
    var myCanvas = document.getElementById("myCanvas");

    myCanvas.height = setMood.height = window.innerHeight - 100; //$(this).height() - 100; Was able to remove jQuery!
    myCanvas.width = setMood.width = window.innerWidth; // $(this).width();
    // Because we want to have transparency (opacity) we need to put each ball in its own layer.
    // Each layer needs to get the same dimensions.
    for (var i in setMood.balls) {
        var myCanvas2 = document.getElementById('myCanvas_' + i);
        myCanvas2.height = setMood.height;
        myCanvas2.width = setMood.width;
    }
    // On resizing a stopped window we still want to see the new balls.
    moveBalls();
}

// Delete all layers before creating new layers for new mood.
function deleteLayers() {
    var child;
    var i = 0, myCanvas = document.getElementById("background");
    while (child = document.getElementById("canvasDiv" + i)) {
        i++;
        myCanvas.removeChild(child);
    }
}

var ball = function (px, py, radius, color, deltaX, deltaY) {
    this.x = px; // Using cartesian coordinates, so x,y are points on the plane.
    this.y = py;
    this.r = radius;
    this.c = color;
    this.dx = deltaX;
    this.dy = deltaY;

    this.move = function () {
        this.clear();
        this.checkWidth();
        this.checkHeight();
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    };

    this.setCanvas = function (canvasId, canvasDiv) {
        this.canvas = canvasId;
        this.canvasDiv = canvasDiv;
    }

    // clear a rectangle two pixels taller and wider than the circle diameter to avoid artifacts.
    this.clear = function () {
        var ballCanvas = document.getElementById(this.canvas);
        var ctx = ballCanvas.getContext("2d");
        ctx.clearRect(this.x - this.r - 1, this.y - this.r - 1, 1 + this.r + setMood.width, 1 + this.r + setMood.height);
    };

    this.checkWidth = function () {
        if (this.x + this.r >= setMood.width) {
            this.dx *= -1;
            this.x = setMood.width - this.r;
        } else if (this.x - this.r <= 0) {
            this.dx *= -1;
            this.x = this.r;
        }
    };

    this.checkHeight = function () {
        if (this.y + this.r >= setMood.height) {
            this.dy *= -1;
            this.y = setMood.height - this.r;
        } else if (this.y - this.r <= 0) {
            this.dy *= -1;
            this.y = this.r;
        }
    };

    this.draw = function () {
        const PI2 = Math.PI * 2;
        var ballCanvas = document.getElementById(this.canvas);
        var ctx = ballCanvas.getContext("2d");
        ctx.fillStyle = this.c;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, PI2, true);
        ctx.closePath();
        ctx.fill();
    };

    this.fadeOut = function () {
        document.getElementById(this.canvasDiv).style.opacity = 0;
    };

    this.fadeIn = function () {
        document.getElementById(this.canvasDiv).style.opacity = setMood.opacity;
    };

};

function restart() {
    moodSwing(document.getElementById(setMood.running));
}

function stopGo() {
    if (setMood.bounceBalls.length) {
        // When stopping, clear intervals for fading and moving balls.
        while(setMood.fadeInterval.length) clearInterval(setMood.fadeInterval.pop());
        while(setMood.bounceBalls.length) clearInterval(setMood.bounceBalls.pop());
        // Change button to read: GO
        document.getElementById('stop').innerHTML = "GO";
    } else {
        // When starting, set intervals for fading and moving balls.
        setMood.bounceBalls.push(setInterval(moveBalls, 30));
        setMood.fadeInterval.push(setInterval(fadeBalls, setMood.seconds));
        // Change button to read: STOP
        document.getElementById('stop').innerHTML = "STOP";
    }
}

function fadeBalls() {
    if (setMood.balls.length > setMood.maxFade) {
        while(setMood.fadeInterval.length) clearInterval(setMood.fadeInterval.pop());
        fadeIn();
        return;
    }

    if (setMood.faded.length) {
        fadeIn();
    } else {
        fadeOut();
    }
}

function fadeIn() {
    while (setMood.faded.length) {
        var b = setMood.faded.pop();
        if (b < setMood.balls.length) setMood.balls[b].fadeIn();
    }
}

function fadeOut() {
    var fadeCount = getRandomInt(setMood.balls.length - 2) + 1, i;
    for (i = 0; i < fadeCount; i++) {
        var b = getRandomInt(setMood.balls.length - 1);
        setMood.faded.push(b);
        setMood.balls[b].fadeOut();
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
