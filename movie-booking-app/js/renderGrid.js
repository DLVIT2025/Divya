const POSTER_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect fill="#2a2838" width="400" height="600"/><text x="200" y="300" fill="#8b8798" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16">No poster</text></svg>'
  );

export function renderMovieGrid(container, movies) {
  container.textContent = '';
  if (movies.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-grid';
    p.textContent = 'No movies match your filters.';
    container.appendChild(p);
    return;
  }
  for (const m of movies) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.tabIndex = 0;
    card.dataset.movieId = m.id;

    const posterWrap = document.createElement('div');
    posterWrap.className = 'movie-card-poster-wrap';
    const img = document.createElement('img');
    img.className = 'movie-card-poster';
    img.src = m.posterUrl;
    img.alt = '';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => {
      if (img.src !== POSTER_PLACEHOLDER) img.src = POSTER_PLACEHOLDER;
    });
    const rating = document.createElement('div');
    rating.className = 'movie-card-rating';
    const star = document.createElement('span');
    star.textContent = '★';
    rating.appendChild(star);
    rating.appendChild(document.createTextNode(` ${m.rating}`));
    posterWrap.appendChild(img);
    posterWrap.appendChild(rating);

    const body = document.createElement('div');
    body.className = 'movie-card-body';
    const h3 = document.createElement('h3');
    h3.className = 'movie-card-title';
    h3.textContent = m.title;
    const meta = document.createElement('p');
    meta.className = 'movie-card-meta';
    meta.textContent = `${m.language} · ${m.genre}`;
    body.appendChild(h3);
    body.appendChild(meta);

    card.appendChild(posterWrap);
    card.appendChild(body);

    const open = () => {
      window.location.href = `movie-detail.html?id=${encodeURIComponent(m.id)}`;
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
    container.appendChild(card);
  }
}
