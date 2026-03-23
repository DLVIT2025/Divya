import { requireAuth } from './auth.js';
import { navigateTo } from './ui.js';
import { openSnacksSelection } from './snacks.js';
import { fetchAllBookings } from './data.js';

let currentMovie = null;
export let selectedSeats = [];
let seatPriceTotal = 0;

// Configuration
const SEAT_PRICES = {
    regular: 150,
    premium: 300,
    vip: 500
};

const ROWS = [
    { label: 'A', type: 'regular', count: 10 },
    { label: 'B', type: 'regular', count: 10 },
    { label: 'C', type: 'premium', count: 10 },
    { label: 'D', type: 'premium', count: 10 },
    { label: 'E', type: 'vip', count: 10 }
];

export const openSeatSelection = async (movie) => {
    if (!requireAuth()) return;

    currentMovie = movie;
    selectedSeats = [];
    seatPriceTotal = 0;

    document.getElementById('seat-movie-title').textContent = movie.title;
    updateSeatFooter();
    
    await renderSeatMap();
    navigateTo('seats-section');
};

const getBookedSeatsFromFirestore = async (movieName) => {
    const allBookings = await fetchAllBookings();
    const movieBookings = allBookings.filter(b => b.movieName === movieName);
    const booked = [];
    movieBookings.forEach(b => {
        if (b.seats) booked.push(...b.seats);
    });
    return booked;
};

const renderSeatMap = async () => {
    const seatMap = document.getElementById('seat-map');
    seatMap.innerHTML = '';
    
    const bookedSeats = await getBookedSeatsFromFirestore(currentMovie.title);

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
            const isBooked = bookedSeats.includes(seatId);
            
            seatDiv.className = `seat seat-${row.type} ${isBooked ? 'occupied' : ''}`;
            seatDiv.dataset.id = seatId;
            seatDiv.dataset.price = SEAT_PRICES[row.type];
            seatDiv.dataset.type = row.type;
            seatDiv.textContent = i;

            if (!isBooked) {
                seatDiv.addEventListener('click', () => toggleSeat(seatDiv));
            }

            rowDiv.appendChild(seatDiv);
        }
        
        seatMap.appendChild(rowDiv);
    });
};

const toggleSeat = (seatDiv) => {
    const seatId = seatDiv.dataset.id;
    const price = parseInt(seatDiv.dataset.price);

    if (seatDiv.classList.contains('selected')) {
        seatDiv.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s.id !== seatId);
        seatPriceTotal -= price;
    } else {
        seatDiv.classList.add('selected');
        selectedSeats.push({
            id: seatId,
            price: price,
            type: seatDiv.dataset.type
        });
        seatPriceTotal += price;
    }

    updateSeatFooter();
};

const updateSeatFooter = () => {
    document.getElementById('selected-seats-count').textContent = selectedSeats.length;
    document.getElementById('selected-seats-list').textContent = selectedSeats.length ? selectedSeats.map(s => s.id).join(', ') : 'None';
    document.getElementById('seats-total').textContent = seatPriceTotal;

    const proceedBtn = document.getElementById('proceed-snacks-btn');
    if (selectedSeats.length > 0) {
        proceedBtn.disabled = false;
    } else {
        proceedBtn.disabled = true;
    }
};

// Event Init
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
