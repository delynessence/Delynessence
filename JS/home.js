// main.js
(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Footer year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Smooth scroll for internal links (fallback-safe)
  const internalLinks = $$('a[href^="#"]');
  internalLinks.forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      try{
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }catch{
        const top = target.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo(0, top);
      }
    });
  });

  // Back to top
  const toTop = $('.to-top');
  if (toTop){
    toTop.addEventListener('click', () => {
      try{ window.scrollTo({top:0, behavior:'smooth'}); }
      catch{ window.scrollTo(0,0); }
    });
  }

  // Nav blur on scroll (desktop visual)
  const nav = $('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 10) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  // Scroll Spy via IntersectionObserver
  const sectionIds = ['home','delynn','links','OurRecap'];
  const sections = sectionIds.map(id => $('#'+id)).filter(Boolean);
  const navLinks = $$('nav a[href^="#"]:not(.nav__brand)'); // exclude brand link
  const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));

  const setActive = (id) => {
    navLinks.forEach(a => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
    const link = map.get(id);
    if (link){
      link.classList.add('is-active');
      link.setAttribute('aria-current','page');
    }
  };

  if ('IntersectionObserver' in window && sections.length){
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          setActive(entry.target.id);
        }
      });
    }, {
      root: null,
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0.01
    });
    sections.forEach(sec => spy.observe(sec));
  }

  // Show/hide Back-to-Top depending on HOME section visibility
  const home = $('#home');
  if ('IntersectionObserver' in window && home && toTop){
    const vis = new IntersectionObserver((entries)=>{
      const e = entries[0];
      if (e && e.isIntersecting) toTop.classList.remove('show');
      else toTop.classList.add('show');
    }, {threshold: 0.6});
    vis.observe(home);
  }else if(toTop){
    // Fallback
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) toTop.classList.add('show');
      else toTop.classList.remove('show');
    }, {passive:true});
  }

  // ScrollReveal (respect prefers-reduced-motion)
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && window.ScrollReveal){
    const sr = ScrollReveal();
    sr.reveal('.reveal-up', { distance:'24px', origin:'bottom', duration:700, interval:100, easing:'cubic-bezier(.2,.6,.2,1)' });
    sr.reveal('.reveal-fade', { opacity:0, duration:600, easing:'cubic-bezier(.2,.6,.2,1)' });
  }

})();

// ==== Delynn photo slider (autoplay) ====
(function(){
  const wrap = document.getElementById('delynn-slider');
  if (!wrap) return;

  const slides = Array.from(wrap.querySelectorAll('.avatar-slide'));
  if (slides.length <= 1) return;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer = null, interval = 4000; // 4 detik

  function show(n){
    slides[i].classList.remove('is-active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
  }

  if (!reduce){
    timer = setInterval(()=> show(i+1), interval);
    // (opsional) pause saat halaman tidak aktif
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden){ clearInterval(timer); timer=null; }
      else if (!timer){ timer = setInterval(()=> show(i+1), interval); }
    });
  }else{
    // reduced motion → tampilkan slide pertama saja
    slides.forEach((img,idx)=> img.classList.toggle('is-active', idx===0));
  }
})();
