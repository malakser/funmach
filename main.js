const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error("WebGL2 not supported");
let dbg = document.getElementById('dbg');

const wB = 100;
const [w, h] = [wB * 8, 600];

const mem = new Uint8Array(wB * h);

const program = gl.createProgram();


const vs = `#version 300 es
in vec2 pos;
out vec2 uv;
void main() {
    gl_Position = vec4(pos, 0.0, 1.0);
    uv = vec2(pos.x * 0.5 + 0.5, -pos.y * 0.5 + 0.5);
}`;

const fs = `#version 300 es
precision highp float;
precision highp usampler2D;

in vec2 uv;
out vec4 fragColor;
uniform usampler2D tex;
uniform vec2 size;
uniform float wB;

uint readBit(vec2 coord) {
    vec2 pos = coord * size;
    float x = floor(pos.x);
    float y = floor(pos.y);
    
    float iB = floor(x / 8.0);
    float ib = 7.0 - mod(x, 8.0);
    
    ivec2 texCoord = ivec2(int(iB), int(y));
    uint texel = texelFetch(tex, texCoord, 0).r;
    
    return (texel & 1u << uint(ib)) != 0u ? 1u : 0u;
}

void main() {
    uint bit = readBit(uv);
    float bitValue = float(bit);
    fragColor = vec4(bitValue, bitValue, bitValue, 1.0);
}`;

[gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, i) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, [vs, fs][i]);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  gl.attachShader(program, shader);
});
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);


const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(program, "pos");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.uniform2f(gl.getUniformLocation(program, 'size'), w, h);
gl.uniform1f(gl.getUniformLocation(program, 'wB'), wB);



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
`;

function fontLoad(font, x1=0, y1=0) {
  let c_last = '\n';
  let x = -1;
  let y = x1;
  let xoff = 0;
  let xoff_new = xoff;
  for (let c of font) {
    if (c != ' ') { 
      if (c == '\n') {
        if (c_last == '\n') {
          xoff = xoff_new;
          y = 0;
        } else {
          xoff_new = x;
          y++;
        }
        x = xoff;
      } else {
        let px = c != '.' ? 1 : 0;
        bset2(x, y, px);
        x++;
      }
    }
    c_last = c;
  }
}

let pc = 0;

function vm() {
  pc = (pc + 4) % mem.length;
}

function nround(x, n) {
  let factor = 10**n;
  return Math.round(x*factor)/factor;
}

function bset(i, v) {
  let Bi = Math.floor(i / 8);
  let bi = 7 - i % 8;
  if (v) mem[Bi] |= (1 << bi);
  else mem[Bi] &= ~(1 << bi);
}

function bset2(x, y, v) {
  let i = w * y + x;
  bset(i, v);
}

let time_last = performance.now();
let steps = 0;

function animate() {
  let time = performance.now();
  let dt = (time - time_last) / 1000;
  time_last = time;
  let fps = 1/dt;
  let hz = steps * fps;
  
  steps = 100e6*Math.min(dt, 1/120);
  for (let i=0; i<steps; i++) vm();

  dbg.innerText = `
  ${nround(fps, 2)} FPS
  ${nround(hz / 10**6, 2)} MHz
  ${fps < 40}
  `;
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, wB, h, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, mem);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(animate);
}

fontLoad(alphanumerics);
animate();

document.addEventListener('keydown', e => {
  if (e.key.length == 1) {
    let off = e.key.charCodeAt(0);
    mem[w*30 + off] = 255;
  }
});

document.addEventListener('keyup', e => {
  if (e.key.length == 1) {
    let off = e.key.charCodeAt(0);
    mem[w*30 + off] = 0;
  }
});
