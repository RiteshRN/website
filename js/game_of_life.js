/* Conway's Game of Life — runs live in the tribute essay. */
(function () {
  var host = document.getElementById('gol');
  if (!host) return;
  var cv = document.createElement('canvas');
  host.appendChild(cv);
  var ctx = cv.getContext('2d');

  var CELL = 7, COLS, ROWS, grid, next, W, H, dpr;

  function accent() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#A99BFF';
  }
  function panel() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--panel').trim() || '#1B1728';
  }

  function seed() {
    for (var i = 0; i < COLS * ROWS; i++) {
      grid[i] = Math.random() < 0.16 ? 1 : 0;
    }
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = host.clientWidth;
    var h = Math.min(300, Math.round(w * 0.42));
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    W = cv.width = w * dpr;
    H = cv.height = h * dpr;
    COLS = Math.floor(W / (CELL * dpr));
    ROWS = Math.floor(H / (CELL * dpr));
    grid = new Uint8Array(COLS * ROWS);
    next = new Uint8Array(COLS * ROWS);
    seed();
  }

  function step() {
    var pop = 0;
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        var n = 0;
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            var xx = (x + dx + COLS) % COLS;
            var yy = (y + dy + ROWS) % ROWS;
            n += grid[yy * COLS + xx];
          }
        }
        var i = y * COLS + x;
        next[i] = grid[i] ? (n === 2 || n === 3 ? 1 : 0)
                          : (n === 3 ? 1 : 0);
        pop += next[i];
      }
    }
    var t = grid; grid = next; next = t;
    if (pop < COLS * ROWS * 0.015) seed(); /* died out → reseed */
  }

  function draw() {
    ctx.fillStyle = panel();
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = accent();
    var s = CELL * dpr;
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (grid[y * COLS + x]) {
          ctx.fillRect(x * s + dpr, y * s + dpr,
                       s - 2 * dpr, s - 2 * dpr);
        }
      }
    }
  }

  size();
  addEventListener('resize', size);
  draw();

  var reduced =
    matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    for (var k = 0; k < 60; k++) step(); /* settle, stay still */
    draw();
    return;
  }
  setInterval(function () { step(); draw(); }, 140);

  /* click to reseed the soup */
  cv.style.cursor = 'pointer';
  cv.addEventListener('click', function () { seed(); draw(); });

  var cap = document.getElementById('gol-cap');
  if (cap) {
    cap.style.cursor = 'pointer';
    cap.addEventListener('click', function () { seed(); draw(); });
  }
})();
