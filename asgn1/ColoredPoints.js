// Vertex shader program with a uniform for point size.
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '}\n';

// Fragment shader program with a uniform variable for color.
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global variables
var gl, canvas;
var a_Position, u_FragColor, u_PointSize;
var shapesList = [];
var currentColor = [1.0, 0.0, 0.0, 1.0];
var currentSize = 10.0;
var currentBrush = 'point';
var currentCircleSegments = 20;

// NEW: Variables for color cycling on drag
var colorCycle = false;      // When true, each new shape gets the next color in the cycle.
var cycleIndex = 0;
var colorCycleArray = [
  [1.0, 0.0, 0.0, 1.0],     // Red
  [1.0, 0.5, 0.0, 1.0],     // Orange
  [1.0, 1.0, 0.0, 1.0],     // Yellow
  [0.0, 1.0, 0.0, 1.0],     // Green
  [0.0, 0.0, 1.0, 1.0],     // Blue
  [0.29, 0.0, 0.51, 1.0],   // Indigo
  [0.56, 0.0, 1.0, 1.0]     // Violet
];

// Setup Functions
function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas, { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get WebGL context.');
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
}

// Shape Classes
class Point {
  constructor(x, y, color, size) {
    this.vertices = [x, y];
    this.color = color;
    this.size = size;
  }
  render() {
    gl.uniform4fv(u_FragColor, this.color);
    gl.uniform1f(u_PointSize, this.size);
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.deleteBuffer(buffer);
  }
}

class Triangle {
  constructor(x, y, color, size) {
    this.vertices = [
      x, y + size,
      x - size, y - size,
      x + size, y - size
    ];
    this.color = color;
  }
  render() {
    gl.uniform4fv(u_FragColor, this.color);
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.deleteBuffer(buffer);
  }
}

class Circle {
  constructor(x, y, color, size, segments) {
    this.vertices = [x, y]; // Center point
    for (let i = 0; i <= segments; i++) {
      let angle = (i * 2 * Math.PI) / segments;
      this.vertices.push(x + size * Math.cos(angle));
      this.vertices.push(y + size * Math.sin(angle));
    }
    this.color = color;
    this.segments = segments;
  }
  render() {
    gl.uniform4fv(u_FragColor, this.color);
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.segments + 2);
    gl.deleteBuffer(buffer);
  }
}

// Render Function
function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let shape of shapesList) {
    shape.render();
  }
}

// Event Handler
function canvasClick(ev) {
  // Get canvas-relative coordinates.
  let x = ev.clientX, y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  
  // If color cycling is enabled, update currentColor with the next color.
  if (colorCycle) {
    currentColor = colorCycleArray[cycleIndex];
    cycleIndex = (cycleIndex + 1) % colorCycleArray.length;
  }
  
  let shape;
  if (currentBrush === 'point') {
    shape = new Point(x, y, currentColor, currentSize);
  } else if (currentBrush === 'triangle') {
    shape = new Triangle(x, y, currentColor, currentSize / 200);
  } else if (currentBrush === 'circle') {
    shape = new Circle(x, y, currentColor, currentSize / 200, currentCircleSegments);
  }
  shapesList.push(shape);
  renderAllShapes();
}

// UI Functions
function setBrush(brush) {
  currentBrush = brush;
}
function updateSize(val) {
  currentSize = parseFloat(val);
}
function updateColor() {
  let r = parseFloat(document.getElementById('redSlider').value);
  let g = parseFloat(document.getElementById('greenSlider').value);
  let b = parseFloat(document.getElementById('blueSlider').value);
  currentColor = [r, g, b, 1.0];
}
function updateCircleSegments(val) {
  currentCircleSegments = parseInt(val);
}
function clearCanvas() {
  shapesList = [];
  renderAllShapes();
}

function toggleColorCycle() {
    colorCycle = !colorCycle;
    let btn = document.getElementById("toggleColorCycleBtn");
    if (btn) {
      btn.textContent = colorCycle ? "Disable Color Cycle" : "Enable Color Cycle";
    }
    // When disabling color cycling, refresh the current color from the sliders.
    if (!colorCycle) {
      updateColor();
    }
  }
  

// NEW: Draw Triangle Art (Improved Tree with Brown Stump)
function drawTriangleArt() {
    let artTriangles = [];
    
    // TRUNK: Two triangles forming a narrow trunk
    artTriangles.push(new Triangle(-0.02, -0.7, [0.55, 0.27, 0.07, 1.0], 0.04)); // left half
    artTriangles.push(new Triangle(0.02, -0.7, [0.55, 0.27, 0.07, 1.0], 0.04));  // right half
    
    // STUMP: One triangle below the trunk to simulate a stump
    // Centered at (0, -0.75) with a size of 0.05 gives a small triangle
    // whose top vertex is at (0, -0.75+0.05 = -0.70) aligning with the trunk bottom,
    // and base from (-0.05, -0.80) to (0.05, -0.80).
    artTriangles.push(new Triangle(0, -0.75, [0.40, 0.2, 0.0, 1.0], 0.05));
    
    // Bottom Canopy (broad base of foliage)
    artTriangles.push(new Triangle(0, -0.4, [0.0, 0.5, 0.0, 1.0], 0.35));           // center bottom
    artTriangles.push(new Triangle(-0.25, -0.4, [0.0, 0.5, 0.0, 1.0], 0.2));          // left detail
    artTriangles.push(new Triangle(0.25, -0.4, [0.0, 0.5, 0.0, 1.0], 0.2));           // right detail
    
    // Middle Canopy (central foliage layer)
    artTriangles.push(new Triangle(0, -0.15, [0.0, 0.7, 0.0, 1.0], 0.25));           // center middle
    artTriangles.push(new Triangle(-0.2, -0.15, [0.0, 0.7, 0.0, 1.0], 0.15));          // left detail
    artTriangles.push(new Triangle(0.2, -0.15, [0.0, 0.7, 0.0, 1.0], 0.15));           // right detail
    
    // Top Canopy (upper foliage)
    artTriangles.push(new Triangle(0, 0.05, [0.0, 0.8, 0.0, 1.0], 0.15));             // center top
    artTriangles.push(new Triangle(-0.1, 0.05, [0.0, 0.8, 0.0, 1.0], 0.1));            // left detail
    artTriangles.push(new Triangle(0.1, 0.05, [0.0, 0.8, 0.0, 1.0], 0.1));             // right detail
    
    // STAR on Top (yellow)
    artTriangles.push(new Triangle(0, 0.22, [1.0, 1.0, 0.0, 1.0], 0.05));
    
    // Additional filler triangles (to bring the total count over 20)
    artTriangles.push(new Triangle(-0.15, -0.2, [0.0, 0.6, 0.0, 1.0], 0.1));
    artTriangles.push(new Triangle(0.15, -0.2, [0.0, 0.6, 0.0, 1.0], 0.1));
    artTriangles.push(new Triangle(-0.25, -0.1, [0.0, 0.65, 0.0, 1.0], 0.08));
    artTriangles.push(new Triangle(0.25, -0.1, [0.0, 0.65, 0.0, 1.0], 0.08));
    artTriangles.push(new Triangle(-0.1, 0.15, [0.0, 0.75, 0.0, 1.0], 0.08));
    artTriangles.push(new Triangle(0.1, 0.15, [0.0, 0.75, 0.0, 1.0], 0.08));
    artTriangles.push(new Triangle(0, -0.55, [0.0, 0.4, 0.0, 1.0], 0.1));
    artTriangles.push(new Triangle(-0.2, -0.55, [0.0, 0.45, 0.0, 1.0], 0.08));
    artTriangles.push(new Triangle(0.2, -0.55, [0.0, 0.45, 0.0, 1.0], 0.08));
    
    shapesList.push(...artTriangles);
    renderAllShapes();
  }  
  

// Main Initialization
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  renderAllShapes();
  canvas.onmousedown = canvasClick;
  canvas.onmousemove = ev => { if (ev.buttons === 1) canvasClick(ev); };
}
window.onload = main;
