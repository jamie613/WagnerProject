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


// Initial load
loadPage('content/about.html');
