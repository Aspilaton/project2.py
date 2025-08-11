// Heart animation code (aynı şekilde)

// requestAnimationFrame polyfill
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

const canvas = document.getElementById("heart");
const ctx = canvas.getContext("2d");
let width, height;
let animationRunning = false;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const heartPosition = (rad) => {
  return [
    Math.pow(Math.sin(rad), 3),
    -(15 * Math.cos(rad) -
      5 * Math.cos(2 * rad) -
      2 * Math.cos(3 * rad) -
      Math.cos(4 * rad)),
  ];
};

let pointsOrigin = [];
let dr = 0.1;
for (let i = 0; i < Math.PI * 2; i += dr) {
  pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
}
for (let i = 0; i < Math.PI * 2; i += dr) {
  pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
}
for (let i = 0; i < Math.PI * 2; i += dr) {
  pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
}
const heartPointsCount = pointsOrigin.length;

function scaleAndTranslate(pos, sx, sy, dx, dy) {
  return [dx + pos[0] * sx, dy + pos[1] * sy];
}

let targetPoints = [];

function pulse(kx, ky) {
  for (let i = 0; i < pointsOrigin.length; i++) {
    targetPoints[i] = [];
    targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
    targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
  }
}

let e = [];
for (let i = 0; i < heartPointsCount; i++) {
  let x = Math.random() * width;
  let y = Math.random() * height;
  e[i] = {
    vx: 0,
    vy: 0,
    R: 2,
    speed: Math.random() + 5,
    q: ~~(Math.random() * heartPointsCount),
    D: 2 * (i % 2) - 1,
    force: 0.2 * Math.random() + 0.7,
    f: "hsla(0," + ~~(40 * Math.random() + 60) + "%," + ~~(60 * Math.random() + 20) + "%,.3)",
    trace: [],
  };
  for (let k = 0; k < 50; k++) e[i].trace[k] = { x: x, y: y };
}

const config = {
  traceK: 0.4,
  timeDelta: 0.01,
};

let time = 0;
function loop() {
  if (!animationRunning) return;

  let n = -Math.cos(time);
  pulse((1 + n) * 0.5, (1 + n) * 0.5);
  time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, width, height);

  for (let i = e.length - 1; i >= 0; i--) {
    let u = e[i];
    let q = targetPoints[u.q];
    let dx = u.trace[0].x - q[0];
    let dy = u.trace[0].y - q[1];
    let length = Math.sqrt(dx * dx + dy * dy);
    if (length < 10) {
      if (Math.random() > 0.95) {
        u.q = ~~(Math.random() * heartPointsCount);
      } else {
        if (Math.random() > 0.99) {
          u.D *= -1;
        }
        u.q += u.D;
        u.q %= heartPointsCount;
        if (u.q < 0) {
          u.q += heartPointsCount;
        }
      }
    }
    u.vx += (-dx / length) * u.speed;
    u.vy += (-dy / length) * u.speed;
    u.trace[0].x += u.vx;
    u.trace[0].y += u.vy;
    u.vx *= u.force;
    u.vy *= u.force;
    for (let k = 0; k < u.trace.length - 1; ) {
      let T = u.trace[k];
      let N = u.trace[++k];
      N.x -= config.traceK * (N.x - T.x);
      N.y -= config.traceK * (N.y - T.y);
    }
    ctx.fillStyle = u.f;
    for (let k = 0; k < u.trace.length; k++) {
      ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
    }
  }
  requestAnimationFrame(loop);
}

// --- TYPEWRITER & GIFT & MUSIC ---

const text = "seni bütün benliğim ile sevmeye devam edeceğim narinim";
const typewriterEl = document.getElementById("typewriter");
const giftContainer = document.querySelector(".gift-container");
const gift = document.getElementById("gift");
const music = document.getElementById("music");
let idx = 0;

function typeWriter() {
  if (idx < text.length) {
    typewriterEl.innerHTML += text.charAt(idx);
    idx++;
    setTimeout(typeWriter, 80);
  } else {
    setTimeout(() => {
      fadeOut(typewriterEl, () => {
        giftContainer.classList.add("show");
      });
    }, 1000);
  }
}

function fadeOut(element, callback) {
  let op = 1;
  const timer = setInterval(() => {
    if (op <= 0.05) {
      clearInterval(timer);
      element.style.display = "none";
      if (callback) callback();
    }
    element.style.opacity = op;
    op -= 0.02;
  }, 50);
}

gift.addEventListener("click", () => {
  if (animationRunning) return;

  music.play().catch((e) => {
    // Bazı tarayıcılar otomatik oynatmayı engeller, izin iste
    console.log("Otomatik müzik oynatma engellendi:", e);
  });
  animationRunning = true;
  canvas.style.display = "block";
  loop();
});

typeWriter();
