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