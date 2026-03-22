import { moviesData } from './data.js';
import { openMovieDetail } from './movieDetail.js';

let currentMovies = [...moviesData];
let searchQuery = '';
let langFilter = 'All';
let genreFilter = 'All';

export const renderMovies = () => {
    // Render trending (first 5)
    const trendingGrid = document.getElementById('trending-movies');
    if (trendingGrid) {
        trendingGrid.innerHTML = moviesData.slice(0, 5).map(m => createMovieCard(m)).join('');
    }

    // Render all movies
    renderAllMoviesGrid();
    attachMovieClickListeners();
};

const renderAllMoviesGrid = () => {
    const grid = document.getElementById('all-movies-grid');
    if (!grid) return;

    // Filter logic
    currentMovies = moviesData.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLang = langFilter === 'All' || m.language === langFilter;
        const matchesGenre = genreFilter === 'All' || m.genre === genreFilter;
        return matchesSearch && matchesLang && matchesGenre;
    });

    if (currentMovies.length === 0) {
        grid.innerHTML = '<div class="w-100 text-center text-muted" style="grid-column: 1/-1; padding: 3rem;">No movies found matching your criteria.</div>';
    } else {
        grid.innerHTML = currentMovies.map(m => createMovieCard(m)).join('');
    }

    attachMovieClickListeners();
};

const createMovieCard = (movie) => {
    // CRITICAL: Card structure follows specific strict UI constraints
    // fixed aspect-ratio, properly placed object-fit img
    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="card-poster">
                <img src="${movie.posterUrl}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&h=750';">
            </div>
            <div class="card-info">
                <div class="card-title" title="${movie.title}">${movie.title}</div>
                <div class="card-meta">
                    <span class="badge">${movie.language}</span>
                    <span class="rating"><i class="fas fa-star text-accent"></i> ${movie.rating}</span>
                </div>
            </div>
        </div>
    `;
};

const attachMovieClickListeners = () => {
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const movieId = card.dataset.id;
            const movie = moviesData.find(m => m.id === movieId);
            if (movie) {
                openMovieDetail(movie);
            }
        });
    });
};

export const initMovieFilters = () => {
    const searchInput = document.getElementById('movie-search');
    const langSelect = document.getElementById('filter-lang');
    const genreSelect = document.getElementById('filter-genre');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderAllMoviesGrid();
        });
    }

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            langFilter = e.target.value;
            renderAllMoviesGrid();
        });
    }

    if (genreSelect) {
        genreSelect.addEventListener('change', (e) => {
            genreFilter = e.target.value;
            renderAllMoviesGrid();
        });
    }
};

export const getMovieById = (id) => moviesData.find(m => m.id === id);
export const getMovieByTitleLoose = (titlePhrase) => {
    const lower = titlePhrase.toLowerCase();
    return moviesData.find(m => m.title.toLowerCase().includes(lower));
};
