// --- Tesseract (hypercube) code with dynamic color ---
function generateVertices() {
  const v = [];
  for (let x = -1; x <= 1; x += 2)
  for (let y = -1; y <= 1; y += 2)
  for (let z = -1; z <= 1; z += 2)
  for (let w = -1; w <= 1; w += 2)
    v.push([x, y, z, w]);
  return v;
}
function generateEdges(verts) {
  const edges = [];
  for (let i = 0; i < verts.length; ++i)
  for (let j = i + 1; j < verts.length; ++j) {
    let diff = 0;
    for (let k = 0; k < 4; ++k)
      if (verts[i][k] !== verts[j][k]) diff++;
    if (diff === 1) edges.push([i, j]);
  }
  return edges;
}
function rot4d(a, b, theta) {
  const m = [
    [1,0,0,0],
    [0,1,0,0],
    [0,0,1,0],
    [0,0,0,1]
  ];
  m[a][a] = Math.cos(theta);
  m[a][b] = -Math.sin(theta);
  m[b][a] = Math.sin(theta);
  m[b][b] = Math.cos(theta);
  return m;
}
function multMatVec(m, v) {
  const r = [];
  for (let i = 0; i < 4; ++i) {
    r[i] = 0;
    for (let j = 0; j < 4; ++j) {
      r[i] += m[i][j] * v[j];
    }
  }
  return r;
}
function matMul(a, b) {
  const r = [];
  for (let i = 0; i < 4; ++i) {
    r[i] = [];
    for (let j = 0; j < 4; ++j) {
      r[i][j] = 0;
      for (let k = 0; k < 4; ++k) r[i][j] += a[i][k] * b[k][j];
    }
  }
  return r;
}
function project4to3([x, y, z, w]) {
  return [x, y, z];
}
function project3to2([x, y, z], width, height, size) {
  return [
    width / 2 + x * size,
    height / 2 + y * size
  ];
}

const canvas = document.getElementById('hypercube');
const ctx = canvas.getContext('2d');
const verts4d = generateVertices();
const edges = generateEdges(verts4d);

let width, height, size;

function resizeCanvas() {
  width = Math.floor(window.innerWidth / 2);
  height = Math.floor(window.innerHeight / 2);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  size = Math.min(width, height) * 0.27;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let prevTimestamp = null;
let hypercubeTime = 0;

let currentColor = "#00fff7";
let currentColorFill = "#00fff7";

function draw(timestamp) {
  if (!prevTimestamp) prevTimestamp = timestamp;
  let delta = (timestamp - prevTimestamp) || 16.67;
  prevTimestamp = timestamp;
  hypercubeTime += delta * 0.0006;

  ctx.clearRect(0, 0, width, height);

  const cssAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
  currentColor = cssAccent ? cssAccent : "#00fff7";
  currentColorFill = currentColor;

  let time = hypercubeTime;

  let m = rot4d(0, 3, time * 1.2);
  m = matMul(rot4d(1, 3, time * 0.8), m);
  m = matMul(rot4d(2, 3, time * 0.6), m);
  m = matMul(rot4d(0, 1, Math.PI / 9), m);
  m = matMul(rot4d(0, 2, Math.PI / 7), m);
  m = matMul(rot4d(1, 2, Math.PI / 11), m);

  const points2d = verts4d.map(v => {
    let v4 = multMatVec(m, v);
    let v3 = project4to3(v4);
    return project3to2(v3, width, height, size);
  });

  ctx.save();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.93;
  for (const [i, j] of edges) {
    ctx.beginPath();
    ctx.moveTo(points2d[i][0], points2d[i][1]);
    ctx.lineTo(points2d[j][0], points2d[j][1]);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = currentColorFill;
  for (const [x, y] of points2d) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

function caesarCipher(str, shift = 5) {
  return str.replace(/[a-z]/gi, c => {
    const code = c.charCodeAt(0);
    const base = (c >= 'a' && c <= 'z') ? 97 : 65;
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
      return String.fromCharCode(((code - base + shift) % 26) + base);
    }
    return c;
  });
}

const passwords = {
  one: "efqlt",
  two: "mfgny",
  three: [
    "xqjsid",
    "xqjsijwfsr",
    "xqjsijw",
    "ymj tusjwfyt",
    "tujwfyt"
  ],
  four: "jnlmyjjsstajrgjw"
};

function checkPassword(input) {
  const shifted = caesarCipher(input.trim().toLowerCase(), 5);
  if (shifted === passwords.one) return 1;
  if (shifted === passwords.two) return 2;
  if (passwords.three.includes(shifted)) return 3;
  if (shifted === passwords.four) return 4;
  return 0;
}

const input = document.getElementById('userInput');
const btn = document.getElementById('enterBtn');
const out = document.getElementById('outputMsg');

function adjustButtonHeight() {
  btn.style.height = input.offsetHeight + 'px';
}

window.addEventListener('resize', adjustButtonHeight);
window.addEventListener('DOMContentLoaded', adjustButtonHeight);
setTimeout(adjustButtonHeight, 100);
input.addEventListener('input', adjustButtonHeight);

function setTheme(theme) {
  document.documentElement.classList.remove('t1', 't2', 't3', 't4');
  if (theme === 1) {
    document.documentElement.classList.add('t1');
  } else if (theme === 2) {
    document.documentElement.classList.add('t2');
  } else if (theme === 3) {
    document.documentElement.classList.add('t3');
  } else if (theme === 4) {
    document.documentElement.classList.add('t4');
  }
}

// Morse code for "... . -..-"
const morsePattern = [
  { beat: true, duration: 200 },   // S
  { beat: false, duration: 200 },  // gap
  { beat: true, duration: 200 },   // S
  { beat: false, duration: 200 },  // gap
  { beat: true, duration: 200 },   // S
  { beat: false, duration: 600 },  // gap (3 units)
  { beat: true, duration: 200 },   // S
  { beat: false, duration: 600 },  // gap (3 units)
  { beat: true, duration: 600 },   // L
  { beat: false, duration: 200 },  // gap
  { beat: true, duration: 200 },   // S
  { beat: false, duration: 200 },  // gap
  { beat: true, duration: 200 },   // S
  { beat: false, duration: 200 },  // gap
  { beat: true, duration: 600 },   // L
];

let heartbeatActive = false;
let heartbeatTimer = null;

function startMorseHeartbeat() {
  const heart = document.getElementById('bigHeart');
  if (!heart) return;
  heartbeatActive = true;
  let i = 0;
  function nextBeat() {
    if (!heartbeatActive) {
      heart.style.transform = 'scale(1)';
      return;
    }
    const { beat, duration } = morsePattern[i];
    heart.style.transform = beat ? 'scale(1.2)' : 'scale(1)';
    i = (i + 1) % morsePattern.length;
    heartbeatTimer = setTimeout(nextBeat, duration);
  }
  nextBeat();
}

function stopMorseHeartbeat() {
  heartbeatActive = false;
  if (heartbeatTimer) clearTimeout(heartbeatTimer);
  const heart = document.getElementById('bigHeart');
  if (heart) heart.style.transform = 'scale(1)';
}

// Audio framework
let carelessAudio = null;
function playCarelessAudio() {
  if (!carelessAudio) {
    carelessAudio = document.createElement('audio');
    carelessAudio.src = 'assets/careless.mp3'; // relative path for GitHub Pages project site
    carelessAudio.id = 'carelessAudio';
    carelessAudio.loop = true;
    carelessAudio.style.display = 'none';
    document.body.appendChild(carelessAudio);
  }
  carelessAudio.currentTime = 0;
  carelessAudio.play().catch(() => {});
}
function stopCarelessAudio() {
  if (carelessAudio) {
    carelessAudio.pause();
    carelessAudio.currentTime = 0;
  }
}

function showHeart() {
  const canvas = document.getElementById('hypercube');
  if (canvas) canvas.style.display = 'none';
  let heart = document.getElementById('bigHeart');
  if (!heart) {
    heart = document.createElement('div');
    heart.id = 'bigHeart';
    heart.innerHTML = `
      <svg width="180" height="150" viewBox="0 0 60 50">
        <path d="M30 47
          L5 25
          A15 15 0 0 1 30 10
          A15 15 0 0 1 55 25
          Z" fill="#ff69b4" stroke="#fff" stroke-width="2"/>
      </svg>
    `;
    heart.style.display = 'flex';
    heart.style.justifyContent = 'center';
    heart.style.alignItems = 'center';
    heart.style.margin = '10px 0 30px 0';
    document.body.insertBefore(heart, document.body.firstChild);
  } else {
    heart.style.display = 'flex';
  }
  startMorseHeartbeat();
  playCarelessAudio();
}

function hideHeart() {
  const canvas = document.getElementById('hypercube');
  if (canvas) canvas.style.display = '';
  const heart = document.getElementById('bigHeart');
  if (heart) heart.style.display = 'none';
  stopMorseHeartbeat();
  stopCarelessAudio();
}

let lastTheme = null;

function handleAction() {
  const value = input.value.trim();
  const passwordType = checkPassword(value);

  if (value.length === 0) {
    setTheme(null);
    lastTheme = null;
    out.textContent = "The void stares back";
    hideHeart();
  } else if (passwordType === 1) {
    setTheme(1);
    lastTheme = 1;
    out.textContent = "good choice";
    hideHeart();
  } else if (passwordType === 2) {
    setTheme(2);
    lastTheme = 2;
    out.textContent = "Got any babies?";
    hideHeart();
  } else if (passwordType === 3) {
    setTheme(3);
    lastTheme = 3;
    out.textContent = "...";
    hideHeart();
    window.open("https://en.wikipedia.org/wiki/Tree", "_blank");
  } else if (passwordType === 4) {
    setTheme(4);
    lastTheme = 4;
    out.textContent = "I love her";
    showHeart();
  } else {
    setTheme(null);
    lastTheme = null;
    out.textContent = "INCORRECT PASSWORD";
    hideHeart();
  }

  input.value = "";
  setTheme(lastTheme);
}

btn.addEventListener('click', handleAction);
input.addEventListener('keydown', function(e) {
  if (e.key === "Enter") {
    handleAction();
  }
});