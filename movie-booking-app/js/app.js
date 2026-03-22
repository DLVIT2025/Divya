/**
 * Run with a local server: npx serve movie-booking-app
 */
import { MOVIES } from './movies.js';
import { state, setSelectedMovie, bumpSnack } from './state.js';
import { getBookedSeatsForMovie } from './storage.js';
import { createBooking } from './booking.js';
import { renderMovieGrid } from './renderGrid.js';
import { renderSeatMap, formatSeatSummary, computeSeatSubtotal } from './seatMap.js';
import {
  filterMovies,
  debounce,
  getUniqueLanguages,
  getUniqueGenres,
} from './filtersSearch.js';
import { renderTicketCard } from './ticketView.js';
import { playBookingSound } from './sound.js';
import { initTheme, toggleTheme } from './theme.js';
import { createVoiceController } from './voice.js';
import { isLoggedIn, getCurrentUser, logoutSession } from './auth.js';
import { renderMyBookings } from './myBookings.js';
import { renderSnackPanel } from './snacksUi.js';
import { computeSnacksSubtotal } from './snacks.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.replace('login.html');
    return;
  }

  initTheme();

  const movieGrid = document.getElementById('movie-grid');
  const bookingsModal = document.getElementById('bookings-modal');
  const bookingsListEl = document.getElementById('bookings-list');
  const searchInput = document.getElementById('search-input');
  const filterLang = document.getElementById('filter-language');
  const filterGenre = document.getElementById('filter-genre');
  const bookingLabel = document.getElementById('booking-movie-label');
  const customerName = document.getElementById('customer-name');
  const seatMapEl = document.getElementById('seat-map');
  const seatSummary = document.getElementById('seat-summary');
  const orderSummary = document.getElementById('order-summary');
  const snacksMount = document.getElementById('snacks-mount');
  const btnBook = document.getElementById('btn-book');
  const ticketSection = document.getElementById('ticket-output');
  const ticketCard = document.getElementById('ticket-card');
  const toastEl = document.getElementById('toast');
  const voiceStatus = document.getElementById('voice-status');
  const btnTheme = document.getElementById('btn-theme');
  const btnVoice = document.getElementById('btn-voice');
  const logoHome = document.getElementById('logo-home');
  const navHome = document.getElementById('nav-home');
  const navBookings = document.getElementById('nav-bookings');
  const navBookingsDash = document.getElementById('nav-bookings-dash');
  const dashName = document.getElementById('dash-name');
  const headerUser = document.getElementById('header-user');
  const btnSignOut = document.getElementById('btn-sign-out');

  for (const lang of getUniqueLanguages()) {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    filterLang.appendChild(opt);
  }
  for (const g of getUniqueGenres()) {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    filterGenre.appendChild(opt);
  }

  function showToast(message, ms = 3200) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.hidden = true;
    }, ms);
  }

  function getFilteredMovies() {
    return filterMovies(state.filters);
  }

  function updateOrderSummary() {
    const seatSub = computeSeatSubtotal(state.selectedSeats);
    const snackSub = computeSnacksSubtotal(state.snackQty);
    const grand = seatSub + snackSub;
    orderSummary.innerHTML = `
      <div class="order-line"><span>Seats</span><strong>₹${seatSub.toLocaleString('en-IN')}</strong></div>
      <div class="order-line"><span>Snacks</span><strong>₹${snackSub.toLocaleString('en-IN')}</strong></div>
      <div class="order-line order-line--total"><span>Total</span><strong>₹${grand.toLocaleString('en-IN')}</strong></div>
    `;
  }

  function refreshGrid() {
    renderMovieGrid(movieGrid, getFilteredMovies());
  }

  function refreshSeatMap() {
    if (!state.selectedMovie) {
      seatMapEl.innerHTML = '<p class="seat-placeholder">Choose a movie to load the seat map.</p>';
      seatSummary.textContent = formatSeatSummary(state.selectedSeats);
      updateOrderSummary();
      return;
    }
    const booked = getBookedSeatsForMovie(state.selectedMovie.id);
    renderSeatMap(seatMapEl, {
      bookedSeats: booked,
      selectedSeats: state.selectedSeats,
      onToggle: (id, meta) => {
        if (state.selectedSeats.has(id)) state.selectedSeats.delete(id);
        else state.selectedSeats.set(id, meta);
        refreshSeatMap();
      },
    });
    seatSummary.textContent = formatSeatSummary(state.selectedSeats);
    updateOrderSummary();
  }

  function renderSnacks() {
    renderSnackPanel(snacksMount, () => {
      updateOrderSummary();
    });
    updateOrderSummary();
  }

  function selectMovieForBooking(m) {
    setSelectedMovie(m);
    const user = getCurrentUser();
    state.userName = user?.displayName || state.userName;
    if (!customerName.value.trim()) customerName.value = state.userName || '';
    bookingLabel.textContent = `Booking for: ${m.title} (${m.language})`;
    ticketSection.hidden = true;
    renderSnacks();
    refreshSeatMap();
    document.getElementById('booking-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function runBooking() {
    const user = getCurrentUser();
    state.userName = customerName.value.trim();
    try {
      const record = createBooking({
        customerName: state.userName,
        movie: state.selectedMovie,
        selectedSeatsMap: state.selectedSeats,
        snackQty: state.snackQty,
        userId: user?.id || null,
      });
      state.selectedSeats.clear();
      state.snackQty = {};
      customerName.value = state.userName;
      refreshSeatMap();
      renderSnacks();
      ticketSection.hidden = false;
      renderTicketCard(ticketCard, record).then(() => {
        ticketSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      playBookingSound();
      showToast('Booking confirmed! Your ticket is ready below.');
    } catch (e) {
      showToast(e.message || 'Booking failed.');
    }
  }

  function goHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function syncUserHeader() {
    const user = getCurrentUser();
    const label = user ? `${user.displayName} (@${user.username})` : '';
    if (dashName) dashName.textContent = user?.displayName || 'Guest';
    if (headerUser) headerUser.textContent = label;
    if (user) {
      state.userName = user.displayName;
      if (!customerName.value.trim()) customerName.value = user.displayName;
    }
  }

  function openBookingsModal() {
    bookingsModal.hidden = false;
    document.body.style.overflow = 'hidden';
    const user = getCurrentUser();
    renderMyBookings(bookingsListEl, user?.id, user?.displayName);
  }

  function closeBookingsModal() {
    bookingsModal.hidden = true;
    document.body.style.overflow = '';
  }

  const debouncedSearch = debounce((value) => {
    state.filters.search = value;
    refreshGrid();
  }, 200);

  searchInput.addEventListener('input', () => debouncedSearch(searchInput.value));
  filterLang.addEventListener('change', () => {
    state.filters.language = filterLang.value;
    refreshGrid();
  });
  filterGenre.addEventListener('change', () => {
    state.filters.genre = filterGenre.value;
    refreshGrid();
  });

  customerName.addEventListener('input', () => {
    state.userName = customerName.value.trim();
  });

  btnBook.addEventListener('click', runBooking);

  btnTheme.addEventListener('click', () => toggleTheme());

  bookingsModal.querySelectorAll('[data-close-bookings]').forEach((el) => {
    el.addEventListener('click', () => closeBookingsModal());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bookingsModal.hidden) closeBookingsModal();
  });

  logoHome.addEventListener('click', (e) => {
    e.preventDefault();
    goHome();
  });
  navHome.addEventListener('click', goHome);
  navBookings.addEventListener('click', openBookingsModal);
  navBookingsDash?.addEventListener('click', openBookingsModal);

  btnSignOut.addEventListener('click', () => {
    logoutSession();
    window.location.href = 'login.html';
  });

  const voice = createVoiceController({
    getMovies: () => MOVIES,
    onSelectMovie: (m) => selectMovieForBooking(m),
    setCustomerName: (name) => {
      state.userName = name;
      customerName.value = name;
    },
    onBookTicket: () => runBooking(),
    onAddSnack: (snackId) => {
      bumpSnack(snackId, 1);
      renderSnacks();
      showToast('Snack added.');
    },
    setStatus: (msg) => {
      voiceStatus.textContent = msg || '';
    },
  });

  btnVoice.addEventListener('click', () => {
    if (!voice.supported) return;
    voice.start();
  });

  syncUserHeader();
  refreshGrid();
  renderSnacks();
  bookingLabel.textContent = 'Select a movie from the grid or open a film’s page to book seats.';
  seatSummary.textContent = formatSeatSummary(state.selectedSeats);
  updateOrderSummary();

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('book');
  if (bookId) {
    const m = MOVIES.find((x) => x.id === bookId);
    if (m) selectMovieForBooking(m);
  }
});
