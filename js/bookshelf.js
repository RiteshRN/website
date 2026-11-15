/* Bookshelf: a spine selects a book.
   Its title and author show below the shelf.
   Without JS the page falls back to a plain list. */
(function () {
  var spines = document.querySelectorAll('.book[data-idx]');
  var entries = document.querySelectorAll('.book-log .entry');
  var log = document.querySelector('.book-log');
  if (!spines.length || !log) return;
  log.classList.add('shelf-mode');

  function select(i) {
    try { localStorage.setItem('last-book', i); } catch (e) {}
    for (var j = 0; j < entries.length; j++) {
      if (j === i) {
        entries[j].setAttribute('open', '');
      } else {
        entries[j].removeAttribute('open');
      }
    }
    for (var k = 0; k < spines.length; k++) {
      spines[k].classList.toggle(
        'active', +spines[k].dataset.idx === i);
    }
  }

  for (var i = 0; i < spines.length; i++) {
    (function (sp) {
      sp.addEventListener('click', function () {
        select(+sp.dataset.idx);
      });
      sp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(+sp.dataset.idx);
        }
      });
    })(spines[i]);
  }

  var saved = 0;
  try {
    saved = parseInt(localStorage.getItem('last-book'), 10);
  } catch (e) {}
  if (!(saved >= 0 && saved < entries.length)) saved = 0;
  select(saved);

  /* arrow buttons page the shelf; dim at the ends */
  var scroller = document.querySelector('.shelf-scroll');
  var prev = document.querySelector('.shelf-nav.prev');
  var next = document.querySelector('.shelf-nav.next');
  if (scroller && prev && next) {
    var page = function (dir) {
      scroller.scrollBy({
        left: dir * scroller.clientWidth * 0.6,
        behavior: 'smooth'
      });
    };
    prev.addEventListener('click', function () { page(-1); });
    next.addEventListener('click', function () { page(1); });
    var edges = function () {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var x = scroller.scrollLeft;
      prev.toggleAttribute('disabled', x <= 4);
      next.toggleAttribute('disabled', x >= max - 4);
    };
    scroller.addEventListener('scroll', edges);
    addEventListener('resize', edges);
    edges();
  }
})();
