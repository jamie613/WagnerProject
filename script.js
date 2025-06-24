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

btn.addEventListener('click', () => {
  nav.classList.toggle('open');
  document.body.classList.toggle('drawer-open');
});

// Close the drawer automatically when a menu link is clicked
nav.addEventListener('click', e => {
  const link = e.target.closest('a[data-page]');
  if (!link) return;                    // clicked something else
  nav.classList.remove('open');         // close drawer
  document.body.classList.remove('drawer-open');
});


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

// Initial load
loadPage('content/about.html');
