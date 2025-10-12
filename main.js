const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error("WebGL not supported");

let time_last = performance.now();
let dbg = document.getElementById('dbg');
let steps = 0;


const program = gl.createProgram();
const vs = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    gl_Position = vec4(position, 0, 1);
    uv = vec2(position.x * 0.5 + 0.5, -position.y * 0.5 + 0.5);
  }`;
//TODO explain uv 0.5
//
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
const [w, h] = [400, 300];
const mem = new ArrayBuffer(w * h * 3);
const bytes = new Uint8Array(mem);



alphanumerics = `
.XXX. XXXX. .XXX. XXXX. XXXXX XXXXX .XXX. X...X .XXX. ....X X...X X.... 
X...X X...X X...X X...X X.... X.... X...X X...X ..X.. ....X X..X. X.... 
X...X X...X X.... X...X X.... X.... X.... X...X ..X.. ....X X.X.. X.... 
X...X XXXX. X.... X...X XXXX. XXXX. X.XXX XXXXX ..X.. ....X XX... X.... 
XXXXX X...X X.... X...X X.... X.... X...X X...X ..X.. X...X X.X.. X.... 
X...X X...X X...X X...X X.... X.... X...X X...X ..X.. X...X X..X. X.... 
X...X XXXX. .XXX. XXXX. XXXXX X.... .XXX. X...X .XXX. .XXX. X...X XXXXX 
..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... 

X...X X...X .XXX. XXXX. .XXX. XXXX. .XXX. XXXXX X...X X...X X...X X...X 
XX.XX XX..X X...X X...X X...X X...X X...X ..X.. X...X X...X X...X X...X 
X.X.X X.X.X X...X X...X X...X X...X X.... ..X.. X...X X...X X...X .X.X. 
X...X X..XX X...X XXXX. X...X XXXX. .XXX. ..X.. X...X X...X X...X ..X.. 
X...X X...X X...X X.... X.X.X X..X. ....X ..X.. X...X X...X X.X.X .X.X. 
X...X X...X X...X X.... X..X. X...X X...X ..X.. X...X .X.X. X.X.X X...X 
X...X X...X .XXX. X.... .XX.X X...X .XXX. ..X.. .XXX. ..X.. .X.X. X...X 
..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... 

X...X XXXXX ..x.. ...x. ..x.. ..x.. ...x. .xxx. ...x. .xxx. ..x.. ..x.. 
X...X ....X .x.x. ..xx. .x.x. .x.x. ..x.. .x... ..x.. ...x. .x.x. .x.x. 
X...X ...X. .x.x. .x.x. ...x. ...x. .x... .x... .x... ...x. .x.x. .x.x. 
.X.X. ..X.. .x.x. ...x. ..x.. ..x.. .x.x. ..x.. .xx.. .xx.. ..x.. ..xx. 
..X.. .X... .x.x. ...x. .x... ...x. .xxx. ...x. .x.x. ..x.. .x.x. ...x. 
..X.. X.... .x.x. ...x. .x... .x.x. ...x. ...x. .x.x. .x... .x.x. ..x.. 
..X.. XXXXX ..x.. ...x. .xxx. ..x.. ...x. .xx.. ..x.. .x... ..x.. .x... 
..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... 
`


function fontLoad(font, x1=0, y1=0) {
  let c_last = '\n';
  let x = -1;
  let y = x1;
  let xoff = 0;
  let xoff_new = xoff;
  for (c of font) {
    if (c != ' ') { 
      if (c == '\n') {
        if (c_last == '\n') {
          xoff = xoff_new;
          y = 0;
        } else {
          xoff_new = x;
          ++y;
        }
        x = xoff;
      } else {
        px = c != '.' ? 1 : 0;
        bytes[(y*w+x)*3] = px * 255;
        ++x;
      }
    }
    c_last = c;
  }
}

fontLoad(alphanumerics);



let pc = 0;
let regs = Uint32Array[32];

function vm() {
  pc = (pc + 4) % mem.length
}

function nround(x, n) {
  let factor = 10**n;
  return Math.round(x*factor)/factor;
}


const min = (x, y) => x < y ? x : y;
const max = (x, y) => x > y ? x : y;


// 6. Animation loop
function animate() {
  let time = performance.now();
  let dt = (time - time_last) / 1000;
  time_last = time;
  let fps = 1/dt;
  let hz = steps * fps;
  
  steps = 100e6*min(dt, 1/120);
  //what even is this?

  dbg.innerText = `
  ${nround(fps, 2)} FPS
  ${nround(hz / 10**6, 2)} MHz
  ${fps < 40}
  `;
  
  for (let i=0; i<steps; i++) vm();

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.UNSIGNED_BYTE, bytes);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(animate);
}


bytes[(w*30 + 3)*3] = 255;

animate();

document.addEventListener('keydown', e => {
  if (e.key.length == 1) {
    let off = e.key.charCodeAt(0);
    bytes[(w*30 + off)*3] ^= off;
  }
})
