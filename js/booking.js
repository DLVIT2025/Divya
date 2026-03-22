import { navigateTo, showToast } from './ui.js';
import { getCurrentUser } from './auth.js';
import { generateQR } from './qrcode.js';

let activeBookingData = null;

// Retrieves previous bookings from localStorage for current user
const getBookings = () => JSON.parse(localStorage.getItem('ct_bookings')) || [];
const saveBookings = (bookings) => localStorage.setItem('ct_bookings', JSON.stringify(bookings));

// Used from snacks to show the final summary BEFORE confirm (which we skip straight to Ticket for simplicity as requested "Generate ticket with...")
export const openBookingSummary = (data) => {
    activeBookingData = data;
    
    // Generate Booking ID
    const bookingId = 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const user = getCurrentUser();

    // Compile final ticket object
    const finalTicket = {
        bookingId,
        userId: user.email,
        userName: user.name,
        movieTitle: data.movie.title,
        movieId: data.movie.id,
        seats: data.seats.map(s => s.id),
        seatTypes: [...new Set(data.seats.map(s => s.type))],
        snacks: data.snacks,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        baseTotal: data.baseTotal,
        snacksTotal: data.snacksTotal,
        grandTotal: data.grandTotal
    };

    // Save to localstorage
    const bookings = getBookings();
    bookings.push(finalTicket);
    saveBookings(bookings);

    // Save booked seats globally to prevent double booking
    const seatStoreKey = `ct_booked_${data.movie.id}`;
    const globallyBooked = JSON.parse(localStorage.getItem(seatStoreKey)) || [];
    localStorage.setItem(seatStoreKey, JSON.stringify([...globallyBooked, ...finalTicket.seats]));

    // Render Ticket View
    renderTicketUI(finalTicket);
    navigateTo('ticket-section');
    showToast('Booking Successful! Enjoy your movie.', 'success');
};

const renderTicketUI = (ticket) => {
    document.getElementById('ticket-movie-title').textContent = ticket.movieTitle;
    document.getElementById('ticket-date').textContent = ticket.date;
    document.getElementById('ticket-user-name').textContent = ticket.userName;
    document.getElementById('ticket-id').textContent = ticket.bookingId;
    
    document.getElementById('ticket-seat-count').textContent = ticket.seats.length;
    document.getElementById('ticket-seats').textContent = ticket.seats.join(', ');
    document.getElementById('ticket-seat-types').textContent = ticket.seatTypes.join(', ');

    // Snacks
    const snacksContainer = document.getElementById('ticket-snacks-container');
    if (ticket.snacks && ticket.snacks.length > 0) {
        snacksContainer.classList.remove('hidden');
        document.getElementById('ticket-snacks').innerHTML = ticket.snacks.map(s => 
            `${s.name} x${s.quantity}`
        ).join('<br>');
    } else {
        snacksContainer.classList.add('hidden');
    }

    document.getElementById('ticket-total-price').textContent = ticket.grandTotal;

    // Generate QR code
    generateQR(`${ticket.bookingId}|${ticket.movieTitle}|${ticket.seats.join(',')}|${ticket.grandTotal}`);
};

// Expose rendering function for "My Tickets" section
export const renderMyTickets = () => {
    const user = getCurrentUser();
    if (!user) return;

    const grid = document.getElementById('my-tickets-grid');
    const bookings = getBookings().filter(b => b.userId === user.email);

    if (bookings.length === 0) {
        grid.innerHTML = '<p class="text-muted">You have no bookings yet.</p>';
        return;
    }

    grid.innerHTML = bookings.reverse().map(b => `
        <div class="mini-ticket glass-panel cursor-pointer" onclick="viewTicket('${b.bookingId}')">
            <h4>${b.movieTitle}</h4>
            <p class="text-sm text-muted">Date: ${b.date} | ID: ${b.bookingId}</p>
            <p class="mt-2"><b>Seats:</b> ${b.seats.join(', ')}</p>
            <h4 class="text-accent mt-2">₹${b.grandTotal}</h4>
        </div>
    `).join('');
};

window.viewTicket = (bookingId) => {
    const booking = getBookings().find(b => b.bookingId === bookingId);
    if(booking) {
        renderTicketUI(booking);
        navigateTo('ticket-section');
    }
};

// Listen for entering "my tickets" section
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.nav-link[data-target="my-tickets-section"]').addEventListener('click', () => {
        renderMyTickets();
    });
});

// HTML2Canvas Ticket Download Exporter
window.downloadTicketImage = () => {
    const ticketEl = document.getElementById('printable-ticket');
    if (!ticketEl) return;
    
    // Check if html2canvas is loaded physically via index.html CDN
    if (typeof html2canvas !== 'undefined') {
        // Temporarily reset styles that might break canvas
        const originalTransform = ticketEl.style.transform;
        ticketEl.style.transform = 'none';

        html2canvas(ticketEl, {
            backgroundColor: '#1E1E2C', // Match dark theme
            scale: 2 // High Resolution
        }).then(canvas => {
            const link = document.createElement('a');
            const bookingId = document.getElementById('ticket-id').textContent || 'Booking';
            link.download = `CineTicket_${bookingId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Restore transform
            ticketEl.style.transform = originalTransform;
        }).catch(err => {
            console.error('Error generating ticket image:', err);
            alert('Failed to generate image. Please try printing.');
        });
    } else {
        alert("Image generation library is still loading or blocked. Please try Print instead.");
    }
};
