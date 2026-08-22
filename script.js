document.getElementById('year').textContent = new Date().getFullYear();

// burger menu
const burger = document.getElementById('burger');
const navlinks = document.getElementById('navlinks');
burger.addEventListener('click', () => {
  const open = navlinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navlinks.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
}));

// category filter
const chips = document.querySelectorAll('.cat-chip');
const blocks = document.querySelectorAll('.cat-block');
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    blocks.forEach(b => {
      b.style.display = (f === 'all' || b.dataset.cat === f) ? '' : 'none';
    });
  });
});

// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- main slider: 4 full-width slides, autoplay + arrows + dots ----------
(function initMainSlider() {
  const viewport = document.getElementById('sliderViewport');
  const track = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (!viewport || !track) return;

  const slides = Array.from(track.children);
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTOPLAY_MS = 5500;

  let index = 0;
  let timer = null;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => {
      d.classList.toggle('active', di === index);
      d.setAttribute('aria-selected', di === index ? 'true' : 'false');
    });
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() { if (timer) clearInterval(timer); timer = null; }

  prevBtn && prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  dots.forEach((d, di) => d.addEventListener('click', () => { goTo(di); startAutoplay(); }));

  const slider = viewport.closest('.main-slider');
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // swipe support
  let touchStartX = 0;
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 40) prev();
    else if (dx < -40) next();
    startAutoplay();
  });

  // keyboard support when the slider has focus
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    if (e.key === 'ArrowRight') { next(); startAutoplay(); }
  });

  goTo(0);
  startAutoplay();
})();

// ---------- banner carousel: auto-scroll + drag ----------
(function initBannerCarousel() {
  const strip = document.getElementById('bannerStrip');
  const track = document.getElementById('bannerTrack');
  if (!strip || !track) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // duplicate the track content once so the loop can wrap seamlessly
  track.innerHTML += track.innerHTML;

  let halfWidth = 0;
  const measure = () => { halfWidth = track.scrollWidth / 2; };
  measure();
  window.addEventListener('resize', measure);

  const SPEED = 0.55; // px per frame, roughly 33px/s at 60fps
  let paused = prefersReducedMotion;
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let dragMoved = false;

  function tick() {
    if (!paused && !isDown) {
      strip.scrollLeft += SPEED;
      if (strip.scrollLeft >= halfWidth) {
        strip.scrollLeft -= halfWidth;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  strip.addEventListener('mouseenter', () => { paused = true; });
  strip.addEventListener('mouseleave', () => { if (!isDown) paused = prefersReducedMotion || false; });

  function pointerDown(x) {
    isDown = true;
    dragMoved = false;
    startX = x;
    startScroll = strip.scrollLeft;
    strip.classList.add('dragging');
  }
  function pointerMove(x) {
    if (!isDown) return;
    const delta = x - startX;
    if (Math.abs(delta) > 4) dragMoved = true;
    strip.scrollLeft = startScroll - delta;
  }
  function pointerUp() {
    isDown = false;
    strip.classList.remove('dragging');
    // normalize scrollLeft back into the first copy's range
    if (halfWidth > 0) {
      if (strip.scrollLeft >= halfWidth) strip.scrollLeft -= halfWidth;
      if (strip.scrollLeft < 0) strip.scrollLeft += halfWidth;
    }
  }

  strip.addEventListener('mousedown', (e) => pointerDown(e.clientX));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX));
  window.addEventListener('mouseup', pointerUp);

  strip.addEventListener('touchstart', (e) => {
    paused = true;
    pointerDown(e.touches[0].clientX);
  }, { passive: true });
  strip.addEventListener('touchmove', (e) => pointerMove(e.touches[0].clientX), { passive: true });
  strip.addEventListener('touchend', () => {
    pointerUp();
    paused = prefersReducedMotion;
  });

  // prevent the click on a banner card from firing right after a drag
  track.addEventListener('click', (e) => { if (dragMoved) e.preventDefault(); }, true);
})();