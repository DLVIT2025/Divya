import { navigateTo, showToast } from './ui.js';
import { getCurrentUser } from './auth.js';
import { generateQR } from './qrcode.js';
import { createBooking, fetchUserBookings } from './data.js';

let activeBookingData = null;

// Used from snacks to show the final summary BEFORE confirm
export const openBookingSummary = async (data) => {
    activeBookingData = data;
    const user = getCurrentUser();
    
    if (!user) {
        showToast('Please login to book tickets.', 'error');
        navigateTo('auth-section');
        return;
    }

    // Generate Booking ID
    const bookingId = 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Compile final ticket object
    const finalTicket = {
        bookingId,
        userName: user.name,
        userEmail: user.email,
        movieName: data.movie.title,
        showTime: data.showTime || "Default Time", // Ensure we have a showTime
        seats: data.seats.map(s => s.id),
        seatTypes: [...new Set(data.seats.map(s => s.type))],
        snacks: data.snacks || [],
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        grandTotal: data.grandTotal
    };

    // Save to Firestore
    const result = await createBooking(finalTicket);
    
    if (result.success) {
        // Render Ticket View
        renderTicketUI(finalTicket);
        navigateTo('ticket-section');
        showToast('Booking Successful! Enjoy your movie.', 'success');
    } else {
        showToast('Booking failed. Please try again.', 'error');
    }
};

export const renderTicketUI = (ticket) => {
    document.getElementById('ticket-movie-title').textContent = ticket.movieName;
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
    generateQR(`${ticket.bookingId}|${ticket.movieName}|${ticket.seats.join(',')}|${ticket.grandTotal}`);
};

// Expose rendering function for "My Tickets" section
export const renderMyTickets = async () => {
    const user = getCurrentUser();
    if (!user) return;

    const grid = document.getElementById('my-tickets-grid');
    grid.innerHTML = '<p class="text-muted">Loading your bookings...</p>';

    const bookings = await fetchUserBookings(user.name);

    if (bookings.length === 0) {
        grid.innerHTML = '<p class="text-muted">You have no bookings yet.</p>';
        return;
    }

    grid.innerHTML = bookings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map(b => `
        <div class="mini-ticket glass-panel cursor-pointer" onclick="viewFirestoreTicket('${b.bookingId}')">
            <h4>${b.movieName}</h4>
            <p class="text-sm text-muted">Date: ${b.date || 'N/A'} | ID: ${b.bookingId}</p>
            <p class="mt-2"><b>Seats:</b> ${b.seats.join(', ')}</p>
            <h4 class="text-accent mt-2">₹${b.grandTotal}</h4>
        </div>
    `).join('');

    // Store globally for quick view
    window.currentBookings = bookings;
};

window.viewFirestoreTicket = (bookingId) => {
    const booking = window.currentBookings?.find(b => b.bookingId === bookingId);
    if(booking) {
        renderTicketUI(booking);
        navigateTo('ticket-section');
    }
};

// Listen for entering "my tickets" section
document.addEventListener('DOMContentLoaded', () => {
    const myTicketsLink = document.querySelector('.nav-link[data-target="my-tickets-section"]');
    if (myTicketsLink) {
        myTicketsLink.addEventListener('click', () => {
            renderMyTickets();
        });
    }
});

// HTML2Canvas Ticket Download Exporter
window.downloadTicketImage = () => {
    const ticketEl = document.getElementById('printable-ticket');
    if (!ticketEl) return;
    
    if (typeof html2canvas !== 'undefined') {
        const originalTransform = ticketEl.style.transform;
        ticketEl.style.transform = 'none';

        html2canvas(ticketEl, {
            backgroundColor: '#1E1E2C',
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            const bookingId = document.getElementById('ticket-id').textContent || 'Booking';
            link.download = `CineTicket_${bookingId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            ticketEl.style.transform = originalTransform;
        }).catch(err => {
            console.error('Error generating ticket image:', err);
            alert('Failed to generate image. Please try printing.');
        });
    } else {
        alert("Image generation library is still loading or blocked. Please try Print instead.");
    }
};
