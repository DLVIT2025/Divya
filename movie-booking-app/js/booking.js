import { saveBooking } from './storage.js';
import { computeSeatSubtotal } from './seatMap.js';
import { computeSnacksSubtotal, buildSnacksLines } from './snacks.js';

function makeBookingId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `BK-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @param {Map<string, { category: string, unitPrice: number }>} selectedSeatsMap
 * @param {Record<string, number>} snackQty
 */
export function createBooking({
  customerName,
  movie,
  selectedSeatsMap,
  snackQty,
  userId,
}) {
  const name = (customerName || '').trim();
  if (!name) {
    throw new Error('Please enter your name.');
  }
  if (!movie) {
    throw new Error('Select a movie first.');
  }
  if (!selectedSeatsMap || selectedSeatsMap.size === 0) {
    throw new Error('Select at least one seat.');
  }

  const seatsDetail = [...selectedSeatsMap.entries()]
    .map(([seatId, v]) => ({
      seatId,
      category: v.category,
      unitPrice: v.unitPrice,
    }))
    .sort((a, b) => a.seatId.localeCompare(b.seatId));

  const seats = seatsDetail.map((s) => s.seatId);
  const seatSubtotal = computeSeatSubtotal(selectedSeatsMap);
  const snacksLines = buildSnacksLines(snackQty || {});
  const snacksSubtotal = computeSnacksSubtotal(snackQty || {});
  const total = seatSubtotal + snacksSubtotal;

  const bookingId = makeBookingId();
  const record = {
    bookingId,
    userId: userId || null,
    accountId: userId || null,
    customerName: name,
    movieId: movie.id,
    movieTitle: movie.title,
    language: movie.language,
    seats,
    seatsDetail,
    snacks: snacksLines,
    seatSubtotal,
    snacksSubtotal,
    total,
    createdAt: new Date().toISOString(),
  };
  saveBooking(record);
  return record;
}
