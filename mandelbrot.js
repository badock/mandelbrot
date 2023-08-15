let WIDTH;
let HEIGHT;
let MAX_ITER = 100;
let MAX_MODULUS = 2;
let COLOR_RESOLUTION = 100;

let minX = -2.5;
let maxX =  1.0;
let minY = -1.0;
let maxY =  1.0;

let imageCounter = 0;
let canvas;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    WIDTH = windowWidth;
    HEIGHT = windowHeight;
    colorMode(HSB, MAX_ITER * COLOR_RESOLUTION);
    cursor("zoom-in");
    pixelDensity(1);
    noLoop();
}

function drawMandelbrotSet() {
    background(100);
    loadPixels();

    let colorsSaved = {};
    for (let i = 0; i < MAX_ITER * COLOR_RESOLUTION; i++) {
        c = color(i, MAX_ITER * COLOR_RESOLUTION, MAX_ITER * COLOR_RESOLUTION);
        colorsSaved[i] = {
            "blue": blue(c),
            "green": green(c),
            "red": red(c),
        };
    }

    let maxRequiredSteps = 0;

    let x;
    let y;

    let maxIter;

    let pixelCoordinate;
    let pixelAsComplexReal;
    let pixelAsComplexIm;

    let zReal;
    let zIm;

    let zRealNew;
    let zImNew;

    let minColorIndex = -1;
    let maxColorIndex = -1;

    let pixelsToColorIndex = [];

    for (let Px=0; Px<WIDTH; Px++) {
        for (let Py=0; Py<HEIGHT; Py++) {
            x = minX + (Px/WIDTH) * (maxX - minX);
            y = minY + (Py/HEIGHT) * (maxY - minY);

            maxIter = 0;

            pixelAsComplexReal = x;
            pixelAsComplexIm = y;

            zReal = 0;
            zIm = 0;

            let zRealNew;
            let zImNew;

            let modulus;
            let prevModulus;
            for (let n = 0; n < MAX_ITER; n++) {
                zRealNew = zReal * zReal - zIm * zIm + pixelAsComplexReal;
                zIm = zReal * zIm + zIm * zReal + pixelAsComplexIm;
                zReal = zRealNew;

                modulus = sqrt(zReal * zReal + zIm * zIm);
                if (modulus > MAX_MODULUS) {
                    break;
                }
                prevModulus = modulus;
                maxIter = n;
            }

            if (maxIter > maxRequiredSteps) {
                maxRequiredSteps = maxIter;
            }

            let colorIndex = maxIter * COLOR_RESOLUTION;

            // Try to enhance the detail level of the mandelbrot figure
            if (maxIter > 1) {
                let lastStepIncrease = modulus - prevModulus;
                let differenceToMaxModulus = modulus - MAX_MODULUS;

                if (lastStepIncrease > 0) {
                    let diffY = (-1) * differenceToMaxModulus / lastStepIncrease;
                    colorIndex += Math.ceil(diffY * COLOR_RESOLUTION);
                }
            }

            pixelsToColorIndex[Px + Py * WIDTH] = colorIndex;

            if (minColorIndex === -1 || minColorIndex > colorIndex) {
                minColorIndex = colorIndex;
            }
            if (maxColorIndex === -1 || maxColorIndex < colorIndex) {
                maxColorIndex = colorIndex;
            }
        }
    }

    for (let Px=0; Px<WIDTH; Px++) {
        for (let Py=0; Py<HEIGHT; Py++) {
            let colorIndex = pixelsToColorIndex[Px + Py * WIDTH];

            // Rescale color
            let newColorIndex = Math.floor(((colorIndex - minColorIndex) / (maxColorIndex - minColorIndex)) * (MAX_ITER * COLOR_RESOLUTION - 1));

            let pixelCoordinate = (Px + Py * WIDTH) * 4;

            pixels[pixelCoordinate] = colorsSaved[newColorIndex]["blue"];
            pixels[pixelCoordinate+1] = colorsSaved[newColorIndex]["green"];
            pixels[pixelCoordinate+2] = colorsSaved[newColorIndex]["red"];
            pixels[pixelCoordinate+3] = 255;
        }
    }

    let scaleWasteRatio = (maxColorIndex - minColorIndex) / maxColorIndex;

    console.log(`maxRequiredSteps: ${maxRequiredSteps}`);
    console.log(`minColorIndex: ${minColorIndex}`);
    console.log(`maxColorIndex: ${maxColorIndex}`);
    console.log(`scaleWasteRatio: ${scaleWasteRatio}`);

    if (scaleWasteRatio < 0.30) {
        MAX_ITER += 10;
    }

    updatePixels();

    //saveCanvas(canvas, `picture${imageCounter}`, 'png');
    //imageCounter += 1;
}

function draw() {
    drawMandelbrotSet();
}

function mouseClicked() {
    let zoomFactor = 2.2;
    let positionX = mouseX > WIDTH ? WIDTH : mouseX;
    let positionY = mouseY > HEIGHT ? HEIGHT : mouseY;
    console.log(`mouse: (${mouseX}, ${mouseY})`);
    zoom(positionX, positionY, zoomFactor);
}

function zoom(x, y, zoomFactor) {
    let dx = maxX - minX;
    let dy = maxY - minY;
    let pointX = minX + x / WIDTH * dx;
    let pointY = minY + y / HEIGHT * dy;

    minX = pointX - dx/(2 * zoomFactor);
    maxX = pointX + dx/(2 * zoomFactor);
    minY = pointY - dy/(2 * zoomFactor);
    maxY = pointY + dy/(2 * zoomFactor);

    drawMandelbrotSet();
}
