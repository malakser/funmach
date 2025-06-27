// 1. Initialize WebGL
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error("WebGL not supported");

// 2. Shader Program
const program = gl.createProgram();
const vs = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    gl_Position = vec4(position, 0, 1);
    uv = position * 0.5 + 0.5;
  }`;
const fs = `
  precision highp float;
  uniform sampler2D texture;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(texture2D(texture, uv).rgb, 1.0);
  }`;

[gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, i) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, [vs, fs][i]);
  gl.compileShader(shader);
  gl.attachShader(program, shader);
});
gl.linkProgram(program);
gl.useProgram(program);

// 3. Full-screen quad
const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
const posLoc = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

// 4. RGB Texture setup
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// 5. Animation variables (RGB only)
const [w, h] = [200, 150];
const pixels = new Uint8Array(w * h * 3);
let time = 0;

// 6. Animation loop
function animate() {
  time += 0.02;
  
  for (let i = 0; i < pixels.length; i += 3) {
    const x = (i/3) % w;
    const y = Math.floor((i/3) / w);
    pixels[i]   = 128 + 127 * Math.sin(x/w * 8 + time);
    pixels[i+1] = 128 + 127 * Math.cos(y/h * 6 + time * 1.3);
    pixels[i+2] = 128 + 127 * Math.sin((x+y)/(w+h) * 10 + time * 2);
  }
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(animate);
}

animate();
