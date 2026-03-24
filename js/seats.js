import { requireAuth } from './auth.js';
import { navigateTo } from './ui.js';
import { openSnacksSelection } from './snacks.js';

let currentMovie = null;
export let selectedSeats = [];
let seatPriceTotal = 0;
let seatQuota = 0; // Number of people / seats to auto-select

// Configuration
const SEAT_PRICES = {
    regular: 150,
    premium: 250,
    vip: 400
};

const ROWS = [
    { label: 'A', type: 'regular', count: 10 },
    { label: 'B', type: 'regular', count: 10 },
    { label: 'C', type: 'regular', count: 10 },
    { label: 'D', type: 'regular', count: 10 },
    { label: 'E', type: 'premium', count: 10 },
    { label: 'F', type: 'premium', count: 10 },
    { label: 'G', type: 'premium', count: 10 },
    { label: 'H', type: 'vip', count: 10 },
    { label: 'I', type: 'vip', count: 10 }
];

// ─── Public entry points ───────────────────────────────────────────

export const openSeatSelection = (movie, quota = 0) => {
    if (!requireAuth()) return;

    currentMovie = movie;
    selectedSeats = [];
    seatPriceTotal = 0;
    seatQuota = quota || 0;

    document.getElementById('seat-movie-title').textContent = movie.title;
    const quotaEl = document.getElementById('seats-quota');
    if (quotaEl) quotaEl.textContent = quota > 0 ? quota : '∞';

    updateSeatFooter();
    renderSeatMap();
    navigateTo('seats-section');
};

// Listen for event from theatres.js people-continue button
window.addEventListener('booking:startSeats', (e) => {
    const { movie, quota } = e.detail;
    openSeatSelection(movie, quota);
});

// ─── Booked seats helper ───────────────────────────────────────────

let bookedSeatsCache = [];

const getBookedSeats = (movieId) => {
    const seed = parseInt(movieId.replace(/\D/g, '')) || 1;
    const booked = [];
    for (let i = 0; i < 8; i++) {
        const row = ROWS[(seed + i * 3) % ROWS.length].label;
        const num = (seed * i) % 10 + 1;
        booked.push(`${row}${num}`);
    }
    const stored = JSON.parse(localStorage.getItem(`ct_booked_${movieId}`)) || [];
    return [...booked, ...stored];
};

// ─── Render ────────────────────────────────────────────────────────

const renderSeatMap = () => {
    const seatMap = document.getElementById('seat-map');
    seatMap.innerHTML = '';

    bookedSeatsCache = getBookedSeats(currentMovie.id);

    ROWS.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';

        const rowLabel = document.createElement('div');
        rowLabel.className = 'row-label';
        rowLabel.textContent = row.label;
        rowDiv.appendChild(rowLabel);

        for (let i = 1; i <= row.count; i++) {
            const seatId = `${row.label}${i}`;
            const seatDiv = document.createElement('div');
            const isBooked = bookedSeatsCache.includes(seatId);

            seatDiv.className = `seat seat-${row.type}${isBooked ? ' occupied' : ''}`;
            seatDiv.dataset.id = seatId;
            seatDiv.dataset.row = row.label;
            seatDiv.dataset.num = i;
            seatDiv.dataset.price = SEAT_PRICES[row.type];
            seatDiv.dataset.type = row.type;
            seatDiv.innerHTML = `<span class="seat-nm">${i}</span><span class="seat-pr">₹${SEAT_PRICES[row.type]}</span>`;

            if (!isBooked) {
                seatDiv.addEventListener('click', () => handleSeatClick(seatDiv));
            }

            rowDiv.appendChild(seatDiv);
        }

        seatMap.appendChild(rowDiv);
    });
};

// ─── Consecutive-selection logic ──────────────────────────────────

/**
 * Find N consecutive available seats in a row starting from startNum.
 * Returns array of seat elements if all found and available, else null.
 */
const findConsecutiveSeats = (rowLabel, startNum, n) => {
    const seats = [];
    for (let i = 0; i < n; i++) {
        const seatId = `${rowLabel}${startNum + i}`;
        const seatEl = document.querySelector(`.seat[data-id="${seatId}"]`);
        if (!seatEl) return null;                              // beyond row boundary
        if (seatEl.classList.contains('occupied')) return null; // blocked by booked seat
        seats.push(seatEl);
    }
    return seats;
};

/** Clear all currently selected seats and reset counters. */
const deselectAll = () => {
    document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
    selectedSeats = [];
    seatPriceTotal = 0;
};

/** Visually select a group of seat elements and push them to state. */
const selectGroup = (seatEls) => {
    seatEls.forEach(seatEl => {
        seatEl.classList.add('selected');
        const price = parseInt(seatEl.dataset.price);
        selectedSeats.push({ id: seatEl.dataset.id, price, type: seatEl.dataset.type });
        seatPriceTotal += price;
    });
};

const handleSeatClick = (seatDiv) => {
    const rowLabel = seatDiv.dataset.row;
    const startNum = parseInt(seatDiv.dataset.num);

    // Clicking an already-selected seat → deselect all (start fresh)
    if (seatDiv.classList.contains('selected')) {
        deselectAll();
        updateSeatFooter();
        return;
    }

    // Quota = 0 or 1 → simple single-seat selection mode
    if (seatQuota <= 1) {
        deselectAll();
        const price = parseInt(seatDiv.dataset.price);
        seatDiv.classList.add('selected');
        selectedSeats.push({ id: seatDiv.dataset.id, price, type: seatDiv.dataset.type });
        seatPriceTotal += price;
        updateSeatFooter();
        return;
    }

    // ── Consecutive auto-selection mode ──────────────────────────
    const n = seatQuota;
    const row = ROWS.find(r => r.label === rowLabel);

    // Would block overflow the row?
    if (startNum + n - 1 > row.count) {
        showSeatToast(
            `Not enough seats from seat ${startNum} to the end of row ${rowLabel}. Try an earlier seat.`
        );
        return;
    }

    const group = findConsecutiveSeats(rowLabel, startNum, n);

    if (!group) {
        showSeatToast(
            `Not enough consecutive available seats in row ${rowLabel} starting from seat ${startNum}. Try a different seat.`
        );
        return;
    }

    // All clear — swap to new group
    deselectAll();
    selectGroup(group);
    updateSeatFooter();
};

// ─── Footer updater ───────────────────────────────────────────────

const updateSeatFooter = () => {
    const countEl = document.getElementById('selected-seats-count');
    if (countEl) countEl.textContent = selectedSeats.length;

    const listEl = document.getElementById('selected-seats-list');
    if (listEl) listEl.textContent = selectedSeats.length
        ? selectedSeats.map(s => s.id).join(', ')
        : 'None';

    const totalEl = document.getElementById('seats-total');
    if (totalEl) totalEl.textContent = seatPriceTotal;

    const proceedBtn = document.getElementById('proceed-snacks-btn');
    const quotaMet = seatQuota > 0
        ? selectedSeats.length === seatQuota
        : selectedSeats.length > 0;
    if (proceedBtn) proceedBtn.disabled = !quotaMet;
};

// ─── Toast helper ─────────────────────────────────────────────────

const showSeatToast = (msg) => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
};

// ─── Init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const proceedBtn = document.getElementById('proceed-snacks-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            if (selectedSeats.length > 0 && currentMovie) {
                openSnacksSelection(currentMovie, selectedSeats, seatPriceTotal);
            }
        });
    }
});
