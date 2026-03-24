// ========================================
// Theatres Module - BookMyShow-style flow
// ========================================
import { navigateTo } from './ui.js';
import { moviesData } from './data.js';

// Booking state - shared across steps
export const bookingState = {
    movie: null,
    theatre: null,
    showTime: null,
    peopleCount: 1,
};

// Static fallback theatres per city (used when backend is unavailable)
const staticTheatres = {
    'Mumbai': [
        { id: 1, name: 'PVR Cinemas - Juhu', city: 'Mumbai', location: 'Juhu, Mumbai', show_times: ['10:00 AM', '1:30 PM', '5:00 PM', '9:00 PM'] },
        { id: 2, name: 'INOX - Lower Parel', city: 'Mumbai', location: 'Phoenix Mills, Lower Parel', show_times: ['11:00 AM', '3:00 PM', '7:00 PM'] },
        { id: 3, name: 'Carnival Cinemas', city: 'Mumbai', location: 'Borivali West, Mumbai', show_times: ['12:00 PM', '4:00 PM', '8:00 PM'] },
    ],
    'Delhi-NCR': [
        { id: 4, name: 'PVR - Select Citywalk', city: 'Delhi-NCR', location: 'Saket, Delhi', show_times: ['9:30 AM', '1:00 PM', '5:30 PM', '9:30 PM'] },
        { id: 5, name: 'INOX - Nehru Place', city: 'Delhi-NCR', location: 'Nehru Place, Delhi', show_times: ['11:00 AM', '3:30 PM', '7:30 PM'] },
    ],
    'Bengaluru': [
        { id: 6, name: 'PVR - Phoenix Marketcity', city: 'Bengaluru', location: 'Whitefield, Bengaluru', show_times: ['10:00 AM', '2:30 PM', '6:00 PM', '9:45 PM'] },
        { id: 7, name: 'INOX - Garuda Mall', city: 'Bengaluru', location: 'Magrath Road, Bengaluru', show_times: ['12:30 PM', '4:30 PM', '8:30 PM'] },
    ],
    'Hyderabad': [
        { id: 8, name: 'AMB Cinemas', city: 'Hyderabad', location: 'Gachibowli, Hyderabad', show_times: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'] },
        { id: 9, name: 'PVR - Banjara Hills', city: 'Hyderabad', location: 'Banjara Hills, Hyderabad', show_times: ['11:30 AM', '3:30 PM', '7:30 PM'] },
    ],
    'Chennai': [
        { id: 10, name: 'Sathyam Cinemas', city: 'Chennai', location: 'Royapettah, Chennai', show_times: ['9:00 AM', '1:00 PM', '5:00 PM', '9:00 PM'] },
        { id: 11, name: 'PVR - VR Chennai', city: 'Chennai', location: 'Anna Salai, Chennai', show_times: ['11:00 AM', '3:00 PM', '7:00 PM'] },
    ],
    'Kochi': [
        { id: 12, name: 'INOX - Lulu Mall', city: 'Kochi', location: 'Edapally, Kochi', show_times: ['10:00 AM', '2:00 PM', '6:00 PM', '9:30 PM'] },
        { id: 13, name: 'PVR - Centre Square Mall', city: 'Kochi', location: 'MG Road, Kochi', show_times: ['12:00 PM', '4:00 PM', '8:00 PM'] },
    ],
    'Ahmedabad': [
        { id: 14, name: 'Cinepolis - Ahmedabad', city: 'Ahmedabad', location: 'Iskon Mega Mall, Ahmedabad', show_times: ['10:30 AM', '2:30 PM', '6:30 PM', '10:00 PM'] },
        { id: 15, name: 'INOX - Alpha One', city: 'Ahmedabad', location: 'Vastrapur, Ahmedabad', show_times: ['1:00 PM', '5:00 PM', '9:00 PM'] },
    ],
    'Pune': [
        { id: 16, name: 'INOX - E Square', city: 'Pune', location: 'University Road, Pune', show_times: ['10:00 AM', '1:30 PM', '5:30 PM', '9:30 PM'] },
        { id: 17, name: 'PVR - Phoenix Marketcity Pune', city: 'Pune', location: 'Nagar Road, Pune', show_times: ['11:00 AM', '3:00 PM', '7:00 PM'] },
    ],
    'Kolkata': [
        { id: 18, name: 'INOX - South City', city: 'Kolkata', location: 'Prince Anwar Shah Road, Kolkata', show_times: ['9:30 AM', '2:00 PM', '6:00 PM', '9:45 PM'] },
        { id: 19, name: 'Cinepolis - Quest Mall', city: 'Kolkata', location: 'Park Circus, Kolkata', show_times: ['12:00 PM', '4:30 PM', '8:30 PM'] },
    ],
    'Chandigarh': [
        { id: 20, name: 'INOX - Elante Mall', city: 'Chandigarh', location: 'Industrial Area, Chandigarh', show_times: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'] },
    ],
};

// Selected showtime state per theatre card
const selectedShowtimes = {};

export const openTheatreSelection = (movie) => {
    bookingState.movie = movie;
    bookingState.theatre = null;
    bookingState.showTime = null;

    // Update UI headers
    const titleEl = document.getElementById('theatre-movie-title');
    if (titleEl) titleEl.textContent = movie.title;

    navigateTo('theatres-section');
    loadTheatres(movie);
};

const loadTheatres = async (movie) => {
    const list = document.getElementById('theatres-list');
    if (!list) return;

    list.innerHTML = '<div class="loader-container"><span class="loader"></span></div>';

    const city = localStorage.getItem('ct_city') || 'Mumbai';
    let theatres = [];

    try {
        const res = await fetch(`http://localhost:3001/api/theatres?city=${encodeURIComponent(city)}&movie_id=${movie.id}`);
        if (!res.ok) throw new Error('API down');
        theatres = await res.json();
        if (theatres.length === 0) throw new Error('No results');
    } catch {
        console.warn('Backend offline. Using static fallback theatres.');
        theatres = staticTheatres[city] || staticTheatres['Mumbai'];
    }

    if (theatres.length === 0) {
        list.innerHTML = '<div class="text-center text-muted" style="padding:3rem">No theatres found for this movie in ' + city + '.</div>';
        return;
    }

    list.innerHTML = theatres.map(t => renderTheatreCard(t)).join('');
    attachTheatreListeners(theatres);
};

const renderTheatreCard = (theatre) => `
<div class="theatre-card glass-panel" data-theatre-id="${theatre.id}">
    <div class="theatre-info">
        <div class="theatre-name-row">
            <i class="fas fa-film text-accent"></i>
            <h3 class="theatre-name">${theatre.name}</h3>
        </div>
        <p class="theatre-location text-muted"><i class="fas fa-map-marker-alt"></i> ${theatre.location}</p>
    </div>
    <div class="showtime-pills">
        ${(theatre.show_times || []).map(t => `
            <button class="showtime-pill" data-time="${t}" data-theatre-id="${theatre.id}">${t}</button>
        `).join('')}
    </div>
    <div class="theatre-footer hidden" id="theatre-footer-${theatre.id}">
        <button class="btn btn-primary w-100 theatre-book-btn" data-theatre-id="${theatre.id}">
            Book Seats <i class="fas fa-arrow-right"></i>
        </button>
    </div>
</div>`;

const attachTheatreListeners = (theatres) => {
    // Showtime pill clicks
    document.querySelectorAll('.showtime-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const theatreId = parseInt(pill.dataset.theatreId);
            const time = pill.dataset.time;

            // Deselect all pills for this theatre
            document.querySelectorAll(`.showtime-pill[data-theatre-id="${theatreId}"]`).forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');

            // Show the book button for this theatre
            const footer = document.getElementById(`theatre-footer-${theatreId}`);
            if (footer) footer.classList.remove('hidden');

            selectedShowtimes[theatreId] = time;
        });
    });

    // Book button clicks
    document.querySelectorAll('.theatre-book-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theatreId = parseInt(btn.dataset.theatreId);
            const theatre = theatres.find(t => t.id === theatreId);
            const showTime = selectedShowtimes[theatreId];
            if (!theatre || !showTime) return;

            bookingState.theatre = theatre;
            bookingState.showTime = showTime;

            // Setup people screen
            const movieInfoEl = document.getElementById('people-movie-info');
            if (movieInfoEl) {
                movieInfoEl.textContent = `${bookingState.movie.title} · ${theatre.name} · ${showTime}`;
            }

            // Reset people count
            bookingState.peopleCount = 1;
            const countEl = document.getElementById('people-count');
            if (countEl) countEl.textContent = '1';

            navigateTo('people-section');
        });
    });
};

export const initPeopleSection = () => {
    const minusBtn = document.getElementById('people-minus');
    const plusBtn = document.getElementById('people-plus');
    const countEl = document.getElementById('people-count');
    const continueBtn = document.getElementById('people-continue-btn');

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            if (bookingState.peopleCount > 1) {
                bookingState.peopleCount--;
                if (countEl) countEl.textContent = bookingState.peopleCount;
            }
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            if (bookingState.peopleCount < 10) {
                bookingState.peopleCount++;
                if (countEl) countEl.textContent = bookingState.peopleCount;
            }
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            // Update seat info subtitle
            const subEl = document.getElementById('seat-info-sub');
            if (subEl) {
                subEl.textContent = `${bookingState.theatre?.name} · ${bookingState.showTime} · ${bookingState.peopleCount} ${bookingState.peopleCount === 1 ? 'person' : 'people'}`;
            }

            // Update quota display
            const quotaEl = document.getElementById('seats-quota');
            if (quotaEl) quotaEl.textContent = bookingState.peopleCount;

            // Trigger seat map rebuild with the quota
            window.dispatchEvent(new CustomEvent('booking:startSeats', {
                detail: {
                    movie: bookingState.movie,
                    quota: bookingState.peopleCount,
                }
            }));

            navigateTo('seats-section');
        });
    }
};
