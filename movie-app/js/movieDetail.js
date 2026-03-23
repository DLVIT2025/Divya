import { openSeatSelection } from './seats.js';

let activeMovie = null;

export const openMovieDetail = (movie) => {
    activeMovie = movie;
    
    // Task: Add console debugging temporarily
    console.log("Opening Movie Detail:", movie);

    const title = movie.title || "Unknown Movie";
    const language = movie.language || "N/A";
    const posterUrl = movie.posterUrl || "";

    // Populate elements
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-lang').textContent = language;
    document.getElementById('detail-genre').textContent = movie.genre || "All";
    document.getElementById('detail-rating').textContent = movie.rating || "N/A";
    document.getElementById('detail-duration').textContent = movie.duration || "N/A";
    
    const detailImg = document.getElementById('detail-poster');
    detailImg.src = posterUrl || "https://picsum.photos/300/450";
    detailImg.onerror = () => {
        detailImg.onerror = null;
        detailImg.src = "https://picsum.photos/300/450";
    };
    document.getElementById('detail-backdrop').style.backgroundImage = 'none';
    document.getElementById('detail-backdrop').style.backgroundColor = 'rgba(0,0,0,0.5)';

    // Populate cast
    const castContainer = document.getElementById('detail-cast');
    if (movie.cast && movie.cast.length > 0) {
        castContainer.innerHTML = movie.cast.map(c => `
            <div class="cast-item">
                <img src="${c.img}" alt="${c.name}" class="cast-img" loading="lazy" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&color=fff&size=150&font-size=0.33';">
                <div class="cast-name">${c.name}</div>
            </div>
        `).join('');
    } else {
        castContainer.innerHTML = '<p class="text-muted text-sm">Cast info not available</p>';
    }

    // Setup Trailer Link
    const trailerBtn = document.getElementById('watch-trailer-btn');
    if (trailerBtn) {
        trailerBtn.onclick = () => {
            const query = encodeURIComponent(movie.title + " trailer");
            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
        };
    }

    // Show overlay
    const overlay = document.getElementById('movie-detail-overlay');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

export const closeMovieDetail = () => {
    activeMovie = null;
    const overlay = document.getElementById('movie-detail-overlay');
    // Add slide down animation class
    const content = document.querySelector('.movie-detail-content');
    content.style.animation = 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        content.style.animation = ''; // reset
        document.body.style.overflow = '';
    }, 300);
};

// Event Listeners setup
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-detail');
    const overlay = document.getElementById('movie-detail-overlay');
    const bookBtn = document.getElementById('book-ticket-btn');

    if (closeBtn) closeBtn.addEventListener('click', closeMovieDetail);
    
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMovieDetail();
    });

    if (bookBtn) bookBtn.addEventListener('click', () => {
        if (activeMovie) {
            const movieToBook = activeMovie;
            closeMovieDetail();
            openSeatSelection(movieToBook);
        }
    });
});
