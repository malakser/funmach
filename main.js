const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error("WebGL2 not supported");
let dbg = document.getElementById('dbg');

const hB = 75;
const [w, h] = [1024, 8*hB];

const mem = new Uint8Array(w * hB);

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
uniform float hB;

uint readBit(vec2 coord) {
    vec2 pos = coord * size;
    float x = floor(pos.x);
    float y = floor(pos.y);
    
    float yB = floor(y / 8.0);
    float ib = 7.0 - mod(y, 8.0);
    
    ivec2 texCoord = ivec2(int(x), int(yB));
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
gl.uniform1f(gl.getUniformLocation(program, 'hB'), hB);



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

X...X XXXXX ..X.. ...X. ..X.. ..X.. ...X. .XXX. ...X. .XXX. ..X.. ..X.. 
X...X ....X .X.X. ..XX. .X.X. .X.X. ..X.. .X... ..X.. ...X. .X.X. .X.X. 
X...X ...X. .X.X. .X.X. ...X. ...X. .X... .X... .X... ...X. .X.X. .X.X. 
.X.X. ..X.. .X.X. ...X. ..X.. ..X.. .X.X. ..X.. .XX.. .XX.. ..X.. ..XX. 
..X.. .X... .X.X. ...X. .X... ...X. .XXX. ...X. .X.X. ..X.. .X.X. ...X. 
..X.. X.... .X.X. ...X. .X... .X.X. ...X. ...X. .X.X. .X... .X.X. ..X.. 
..X.. XXXXX ..X.. ...X. .XXX. ..X.. ...X. .XX.. ..X.. .X... ..X.. .X... 
..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... 
`;

function fontLoad(font, x1=0, y1=0) {
  let c_last = '\n';
  let x = x1 - 1; //TODO this does nothing other than declaring x
  let y = y1;
  let xoff = x1;
  let xoff_new = xoff;
  for (let c of font) {
    if (c != ' ') { 
      if (c == '\n') {
        if (c_last == '\n') {
          xoff = xoff_new;
          y = y1;
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
  let yB = Math.floor(y / 8);
  let iB = w * yB + x;
  let ib = 7 - y % 8;
  if (v) mem[iB] |= (1 << ib);
  else mem[iB] &= ~(1 << ib);
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
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, w, hB, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, mem);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(animate);
}

fontLoad(alphanumerics, 8, 8);
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
