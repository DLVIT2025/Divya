export function openMovieModal(modalEl, movie, { onBook }) {
  const modal = modalEl;
  const body = modal.querySelector('#modal-body');
  const titleId = 'modal-title';
  body.innerHTML = `
    <div class="modal-hero" style="--banner:url('${cssEscapeUrl(movie.bannerUrl || movie.posterUrl)}')">
      <div class="modal-hero-gradient"></div>
      <div class="modal-hero-inner container">
        <img class="modal-poster" src="${escapeAttr(movie.posterUrl)}" alt="" referrerpolicy="no-referrer" />
        <div class="modal-hero-text">
          <h2 id="${titleId}" class="modal-film-title">${escapeHtml(movie.title)}</h2>
          <p class="modal-film-meta">${escapeHtml(movie.language)} · ${escapeHtml(movie.genre)} · ★ ${escapeHtml(String(movie.rating))}</p>
          <p class="modal-synopsis">${escapeHtml(movie.synopsis)}</p>
          <button type="button" class="btn-primary modal-book-btn" data-action="book">Book seats</button>
        </div>
      </div>
    </div>
    <div class="modal-cast container">
      <h3 class="modal-cast-heading">Cast</h3>
      <div class="cast-scroller">
        ${movie.cast
          .map(
            (c) => `
          <figure class="cast-card">
            <img class="cast-avatar" src="${escapeAttr(c.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
            <figcaption>${escapeHtml(c.name)}</figcaption>
          </figure>
        `
          )
          .join('')}
      </div>
    </div>
  `;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  body.querySelector('[data-action="book"]').addEventListener('click', () => {
    closeMovieModal(modal);
    onBook(movie);
  });
}

export function closeMovieModal(modalEl) {
  modalEl.hidden = true;
  const bookingsModal = document.getElementById('bookings-modal');
  if (!bookingsModal || bookingsModal.hidden) {
    document.body.style.overflow = '';
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

function cssEscapeUrl(url) {
  return String(url).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
