import { getBookingsForAccount } from './storage.js';

export function renderMyBookings(container, userId, displayName) {
  const list = getBookingsForAccount(userId, displayName).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  if (list.length === 0) {
    container.innerHTML =
      '<p class="bookings-empty">No bookings yet. Pick a movie and grab some seats.</p>';
    return;
  }
  const frag = document.createDocumentFragment();
  for (const b of list) {
    const el = document.createElement('article');
    el.className = 'booking-row';
    const when = new Date(b.createdAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const total = b.total != null ? ` · ₹${Number(b.total).toLocaleString('en-IN')}` : '';
    const seats = Array.isArray(b.seats) ? b.seats.join(', ') : '';
    el.innerHTML = `
      <div class="booking-row-main">
        <strong class="booking-film">${escapeHtml(b.movieTitle)}</strong>
        <span class="booking-meta">${escapeHtml(b.language)} · ${escapeHtml(seats)}${escapeHtml(total)}</span>
      </div>
      <div class="booking-row-side">
        <span class="booking-when">${escapeHtml(when)}</span>
        <code class="booking-code">${escapeHtml(b.bookingId)}</code>
      </div>
    `;
    frag.appendChild(el);
  }
  container.textContent = '';
  container.appendChild(frag);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}
