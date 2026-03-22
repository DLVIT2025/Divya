import { MOVIES } from './movies.js';
import { initTheme } from './theme.js';
import { isLoggedIn } from './auth.js';

initTheme();

if (!isLoggedIn()) {
  window.location.replace('login.html');
} else {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const movie = MOVIES.find((m) => m.id === id);
  const root = document.getElementById('detail-root');
  if (!movie) {
    root.innerHTML =
      '<div class="container detail-error"><p>Movie not found.</p><a href="index.html">Home</a></div>';
  } else {
    document.title = `${movie.title} — ShowTime`;
    root.className = 'detail-page detail-animate';
    root.innerHTML = `
      <div class="detail-banner">
        <div class="detail-banner-shade"></div>
        <div class="container detail-banner-inner">
          <img class="detail-poster" src="${escAttr(movie.posterUrl)}" alt="" referrerpolicy="no-referrer" />
          <div class="detail-banner-text">
            <h1 class="detail-title">${esc(movie.title)}</h1>
            <p class="detail-meta">${esc(movie.language)} · ${esc(movie.genre)} · ★ ${esc(String(movie.rating))}</p>
            <p class="detail-synopsis">${esc(movie.synopsis)}</p>
            <a class="btn-primary" href="index.html?book=${encodeURIComponent(movie.id)}">Book seats</a>
          </div>
        </div>
      </div>
      <div class="container detail-cast-block">
        <h2 class="detail-cast-title">Cast</h2>
        <div class="cast-scroller detail-cast-scroll">
          ${movie.cast
            .map(
              (c) => `
            <figure class="cast-card">
              <img class="cast-avatar" src="${escAttr(c.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
              <figcaption>${esc(c.name)}</figcaption>
            </figure>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    const bannerEl = root.querySelector('.detail-banner');
    if (bannerEl) {
      const u = movie.bannerUrl || movie.posterUrl;
      bannerEl.style.backgroundImage = `url(${JSON.stringify(u)})`;
    }
  }
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}
function escAttr(s) {
  return esc(s).replace(/'/g, '&#39;');
}
