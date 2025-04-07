// asg0.js

// Function to draw a vector on the canvas.
// 'v' is an instance of Vector3, 'color' is a string (e.g. "red"),
// and 'ctx' is the 2D canvas rendering context.
function drawVector(v, color, ctx) {
    ctx.beginPath();
    // Origin at center (200,200)
    ctx.moveTo(200, 200);
    
    // Scale by 20 for visualization (invert y axis)
    var x = 200 + v.elements[0] * 20;
    var y = 200 - v.elements[1] * 20;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  // Function to compute the area of the triangle formed by v1 and v2.
  function areaTriangle(v1, v2) {
    // Cross product gives the parallelogram area vector.
    var crossVec = Vector3.cross(v1, v2);
    // The area of the parallelogram is the magnitude of the cross product.
    var parallelogramArea = crossVec.magnitude();
    // The area of the triangle is half of that.
    return parallelogramArea / 2;
  }
  
  // Compute the angle between two vectors (previously defined).
  function angleBetween(v1, v2) {
    let dotVal = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    let cosAngle = dotVal / (mag1 * mag2);
    cosAngle = Math.min(1, Math.max(-1, cosAngle));
    let angleRad = Math.acos(cosAngle);
    let angleDeg = angleRad * 180 / Math.PI;
    return { angleDeg, angleRad };
  }
  
  // Main function that initializes the canvas.
  function main() {
    var canvas = document.getElementById('example');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
    }
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw initial vectors.
    handleDrawEvent();
  }
  
  // Draw the two vectors from the input fields.
  function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    var x1 = parseFloat(document.getElementById('xCoord1').value);
    var y1 = parseFloat(document.getElementById('yCoord1').value);
    var x2 = parseFloat(document.getElementById('xCoord2').value);
    var y2 = parseFloat(document.getElementById('yCoord2').value);
    
    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);
    
    drawVector(v1, "red", ctx);
    drawVector(v2, "blue", ctx);
  }
  
  // Operation handler.
  function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    var x1 = parseFloat(document.getElementById('xCoord1').value);
    var y1 = parseFloat(document.getElementById('yCoord1').value);
    var x2 = parseFloat(document.getElementById('xCoord2').value);
    var y2 = parseFloat(document.getElementById('yCoord2').value);
    
    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);
    
    var op = document.getElementById('operation').value;
    var scalar = parseFloat(document.getElementById('scalar').value);
    
    if (op === "add" || op === "sub") {
      var v3 = new Vector3(v1.elements);
      if (op === "add") {
        v3.add(v2);
      } else {
        v3.sub(v2);
      }
      drawVector(v1, "red", ctx);
      drawVector(v2, "blue", ctx);
      drawVector(v3, "green", ctx);
      
    } else if (op === "mul" || op === "div") {
      var v3 = new Vector3(v1.elements);
      var v4 = new Vector3(v2.elements);
      if (op === "mul") {
        v3.mul(scalar);
        v4.mul(scalar);
      } else {
        v3.div(scalar);
        v4.div(scalar);
      }
      drawVector(v1, "red", ctx);
      drawVector(v2, "blue", ctx);
      drawVector(v3, "green", ctx);
      drawVector(v4, "green", ctx);
      
    } else if (op === "magnitude") {
      console.log("Magnitude of v1: " + v1.magnitude());
      console.log("Magnitude of v2: " + v2.magnitude());
      drawVector(v1, "red", ctx);
      drawVector(v2, "blue", ctx);
      
    } else if (op === "normalize") {
      drawVector(v1, "red", ctx);
      drawVector(v2, "blue", ctx);
      var v1norm = new Vector3(v1.elements);
      var v2norm = new Vector3(v2.elements);
      v1norm.normalize();
      v2norm.normalize();
      drawVector(v1norm, "green", ctx);
      drawVector(v2norm, "green", ctx);
      
    } else if (op === "angleBetween") {
      let result = angleBetween(v1, v2);
      console.log("Angle between v1 and v2 (degrees): " + result.angleDeg);
      drawVector(v1, "red", ctx);
      drawVector(v2, "blue", ctx);
      
      // Visualize the angle with an arc.
      let angle1 = Math.atan2(-v1.elements[1], v1.elements[0]);
      let arcRadius = 30;
      ctx.beginPath();
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.arc(200, 200, arcRadius, angle1, angle1 + result.angleRad, false);
      ctx.stroke();
      
    } else if (op === "area") {
      // Compute area of the triangle.
      let area = areaTriangle(v1, v2);
      console.log("Area of the triangle formed by v1 and v2: " + area);
      // Draw original vectors.
      drawVector(v1, "red", ctx);
      drawVector(v2, "blue", ctx);
    }
  }
  