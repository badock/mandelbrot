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
  
  for (let Px=0; Px<WIDTH; Px++) {
    for (let Py=0; Py<HEIGHT; Py++) {
      pixelCoordinate = (Px + Py * WIDTH) * 4;
      
      x = minX + (Px/WIDTH) * (maxX - minX);
      y = minY + (Py/HEIGHT) * (maxY - minY);
      
      maxIter = 0;
      
      pixelAsComplexReal = x;
      pixelAsComplexIm = y;
      
      zReal = 0;
      zIm = 0;
      
      zRealNew;
      zImNew;
      
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

      pixels[pixelCoordinate] = colorsSaved[colorIndex]["blue"];
      pixels[pixelCoordinate+1] = colorsSaved[colorIndex]["green"];
      pixels[pixelCoordinate+2] = colorsSaved[colorIndex]["red"];
      pixels[pixelCoordinate+3] = 255;
    }
  }
  
  console.log(`maxRequiredSteps: ${maxRequiredSteps}`);  
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
