// ─── Service-worker ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  addEventListener('load', () =>
    navigator.serviceWorker.register('./sw.js')
      .catch(e => console.error('SW registration failed:', e))
  );
}

// ─── Tiny router (data-page links anywhere in the DOM) ───────
const contentEl = document.getElementById('content');

// ─── Hamburger drawer ───────────────────────────────
const btn  = document.getElementById('menu-toggle');
const nav  = document.getElementById('menu');
const ovl  = document.getElementById('drawer-overlay'); 

function openDrawer(){
  nav.classList.add('open');
  document.body.classList.add('drawer-open');
}
function closeDrawer(){
  nav.classList.remove('open');
  document.body.classList.remove('drawer-open');
}

btn.addEventListener('click', () => {
  nav.classList.contains('open') ? closeDrawer() : openDrawer();
});

// any menu link closes it
nav.addEventListener('click', e => {
  const link = e.target.closest('a[data-page]');
  if (link) closeDrawer();
});

// click outside (overlay) closes it
ovl.addEventListener('click', closeDrawer);


// Central navigation function
async function loadPage(page) {
  try {
    const resp = await fetch(page);
    contentEl.innerHTML = await resp.text();
    // After new content is injected, it may contain more data-page links
  } catch {
    contentEl.innerHTML =
      '<p>Content unavailable offline (or file missing).</p>';
  }
}

// Event delegation: catch any click on <a data-page="…">
addEventListener('click', e => {
  const link = e.target.closest('a[data-page]');
  if (!link) return;

  e.preventDefault();
  const page = link.dataset.page;
  loadPage(page);

  // Update browser history (optional)
  history.pushState({ page }, '', '#' + page);
});

// Back/forward buttons
addEventListener('popstate', e => {
  loadPage((e.state && e.state.page) || 'content/about.html');
});

// ─── Back-to-top button ───────────────────────────────
const topBtn = document.getElementById('back-top');

// reveal button after 100 px scroll
addEventListener('scroll', () => {
  if (window.scrollY > 100){
    topBtn.classList.add('visible');
  }else{
    topBtn.classList.remove('visible');
  }
});

// smooth scroll to top
topBtn.addEventListener('click', () => {
  window.scrollTo({ top:0, behavior:'smooth' });
});

// ─── Font-size controls ──────────────────────────────────
const plus  = document.getElementById('font-plus');
const minus = document.getElementById('font-minus');

let scale = parseFloat(localStorage.getItem('fontScale')) || 1;  // 1 × = 100 %

function applyScale(){
  document.documentElement.style.fontSize = (100 * scale) + '%';
}
applyScale();                               // set size on page load

plus .addEventListener('click', () => {
  if (scale < 1.6){                         // upper cap ≈ 160 %
    scale = Math.round((scale + 0.1)*10)/10;
    applyScale();
    localStorage.setItem('fontScale', scale);
  }
});
minus.addEventListener('click', () => {
  if (scale > 0.7){                         // lower cap ≈ 70 %
    scale = Math.round((scale - 0.1)*10)/10;
    applyScale();
    localStorage.setItem('fontScale', scale);
  }
});

// ─── Theme switch (☀️ / 🌙) ────────────────────────────────
const root      = document.documentElement;
const btnLight  = document.getElementById('light-btn');
const btnDark   = document.getElementById('dark-btn');

function setTheme(mode){
  if (mode === 'dark'){
    root.classList.add('theme-dark');
    btnDark.classList.add('active');   btnLight.classList.remove('active');
  }else{
    root.classList.remove('theme-dark');
    btnLight.classList.add('active');  btnDark.classList.remove('active');
  }
  localStorage.setItem('theme', mode);
}

/* initialise from saved value or OS preference */
const saved = localStorage.getItem('theme');
if (saved){
  setTheme(saved);
}else if (window.matchMedia('(prefers-color-scheme: dark)').matches){
  setTheme('dark');
}else{
  setTheme('light');
}

btnLight.addEventListener('click', () => setTheme('light'));
btnDark .addEventListener('click', () => setTheme('dark'));

// Initial load
loadPage('content/about.html');
