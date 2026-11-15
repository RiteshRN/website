/* Lights for the poem Eight Billion Lives.
   Fills the .lights rail with small dots. Each dot has its
   own timing, so no two stay in step.

   The poem has 6 couplets on 17 lines (12 lines of verse,
   5 blank lines). The first 5 couplets each name a person.
   Each of those 5 gets one larger purple dot, level with
   its couplet. The other dots are plain.

   Each dot does three things.
   1. It appears. The 5 named dots appear one at a time,
      top to bottom, and the plain dots appear after them.
   2. It fades in and out, with a period of 2 to 6 seconds.
   3. It drifts up to 16 px from its place and back, with
      a period of 8 to 20 seconds.

   Example: <div class="lights" aria-hidden="true"></div> */
(function () {
  var rail = document.querySelector('.lights');
  if (!rail) return;

  var NUM_PLAIN = 220;
  var NUM_LINES = 17;
  var NUM_NAMED = 5;
  // Horizontal place of each named dot, in percent
  var NAMED_X = [22, 68, 40, 81, 55];
  // Seconds between one named dot appearing and the next
  var NAMED_GAP = 0.7;
  // Seconds over which the plain dots appear
  var PLAIN_SPREAD = 3;
  var MAX_DRIFT = 16;  // px

  // Fixed seed, so the dots sit in the same place every visit
  var state = 8;
  // Returns a number in [0, 1) (mulberry32)
  function random() {
    state = (state + 0x6D2B79F5) | 0;
    var t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  // Returns a number in [low, high)
  function between(low, high) {
    return low + random() * (high - low);
  }

  // Adds one dot at (x, y), both in percent of the rail
  // The dot appears appearDelay seconds after the page loads
  function addLight(x, y, className, appearDelay) {
    var fadePeriod = between(2, 6);
    var light = document.createElement('span');
    var style = light.style;
    light.className = className;
    style.left = x + '%';
    style.top = y + '%';
    style.setProperty('--appear', appearDelay + 's');
    style.setProperty('--fade', fadePeriod + 's');
    // A negative delay starts the dot partway through its fade
    style.setProperty('--phase', -between(0, 2 * fadePeriod) + 's');
    style.setProperty('--drift', between(8, 20) + 's');
    style.setProperty('--dx', between(-MAX_DRIFT, MAX_DRIFT) + 'px');
    style.setProperty('--dy', between(-MAX_DRIFT, MAX_DRIFT) + 'px');
    style.setProperty('--ring', between(4, 7) + 's');
    rail.appendChild(light);
  }

  var plainStart = NUM_NAMED * NAMED_GAP;
  for (var i = 0; i < NUM_PLAIN; i++) {
    var delay = plainStart + between(0, PLAIN_SPREAD);
    addLight(between(0, 100), between(0, 100), 'light', delay);
  }
  for (var k = 0; k < NUM_NAMED; k++) {
    // Couplet k covers lines 3k and 3k + 1, so its middle is 3k + 1
    var y = (3 * k + 1) / NUM_LINES * 100;
    addLight(NAMED_X[k], y, 'light named', k * NAMED_GAP);
  }
})();
