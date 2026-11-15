/* Typography helper.
   1) Joins each paragraph's last words with non-breaking
      spaces so a final line can't be a single short word.
   2) Measures real rendered lines; if the last line is
      stubby (< MIN_FRAC of the paragraph width), narrows
      the paragraph a few percent until it absorbs more
      words. Re-runs on resize. */
(function () {
  var SEL = '.prose p, .about-copy p, .d, .after, .card p, ' +
            'blockquote, .facts li, .entry .notes p';
  var GLUE = 2;          /* last line always has 3+ words   */
  var MIN_FRAC = 0.18;   /* min last-line / paragraph width */
  var MAX_SHRINK = 0.10; /* narrow a paragraph at most 10%  */

  function glue(el) {
    var walker = document.createTreeWalker(
      el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var joined = 0;
    for (var i = nodes.length - 1;
         i >= 0 && joined < GLUE; i--) {
      var t = nodes[i].data;
      while (joined < GLUE) {
        var m = /^([\s\S]*\S)\s+(\S[\s\S]*?)$/.exec(
          t.replace(/\s+$/, ' '));
        if (!m) break;
        t = m[1] + ' ' + m[2] +
            (/\s$/.test(nodes[i].data) ? ' ' : '');
        joined++;
      }
      nodes[i].data = t;
    }
  }

  /* line boxes: merge inline fragments that share a row */
  function lines(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var rects = r.getClientRects();
    var out = [];
    for (var i = 0; i < rects.length; i++) {
      var rc = rects[i];
      if (rc.width < 1 || rc.height < 1) continue;
      var last = out[out.length - 1];
      if (last && Math.abs(rc.top - last.top) < 4) {
        last.left = Math.min(last.left, rc.left);
        last.right = Math.max(last.right, rc.right);
      } else {
        out.push({ top: rc.top, left: rc.left,
                   right: rc.right });
      }
    }
    return out;
  }

  function lastLineFrac(el) {
    var ls = lines(el);
    if (ls.length < 2) return 1; /* single line: fine */
    var last = ls[ls.length - 1];
    return (last.right - last.left) / el.clientWidth;
  }

  function tame(el) {
    el.style.maxWidth = '';
    if (lastLineFrac(el) >= MIN_FRAC) return;
    var w = el.clientWidth;
    for (var pct = 0.02; pct <= MAX_SHRINK; pct += 0.02) {
      el.style.maxWidth = Math.round(w * (1 - pct)) + 'px';
      if (lastLineFrac(el) >= MIN_FRAC) return;
    }
    el.style.maxWidth = ''; /* give up gracefully */
  }

  var els = [];
  function run() {
    els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      glue(els[i]);
      tame(els[i]);
    }
  }

  var timer = 0;
  addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      for (var i = 0; i < els.length; i++) tame(els[i]);
    }, 160);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
