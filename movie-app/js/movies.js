import { openMovieDetail } from './movieDetail.js';

let localMoviesData = [];
let currentMovies = [];
let searchQuery = '';
let langFilter = 'All';
let genreFilter = 'All';

export const renderMovies = (movies = []) => {
    localMoviesData = movies;
    currentMovies = [...localMoviesData];

    // Render trending (first 5)
    const trendingGrid = document.getElementById('trending-movies');
    if (trendingGrid) {
        trendingGrid.innerHTML = localMoviesData.slice(0, 5).map(m => createMovieCard(m)).join('');
    }

    // Render all movies
    renderAllMoviesGrid();
};

const renderAllMoviesGrid = () => {
    const grid = document.getElementById('all-movies-grid');
    if (!grid) return;

    // Filter logic
    currentMovies = localMoviesData.filter(m => {
        const title = m.title || '';
        const language = m.language || '';
        const genre = m.genre || 'All';

        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLang = langFilter === 'All' || language === langFilter;
        const matchesGenre = genreFilter === 'All' || genre === genreFilter;
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
    // Task: Add console debugging temporarily
    console.log("Rendering Movie Card:", movie);

    // Task: Fix undefined values and standardize field
    const title = movie.title || "Unknown Movie";
    const language = movie.language || "N/A";
    const posterUrl = movie.posterUrl || ""; // Use empty string to trigger onError if needed
    const rating = movie.rating || 'N/A';
    
    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="card-poster">
                <img 
                    src="${posterUrl || 'https://picsum.photos/300/450'}" 
                    alt="${title}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://picsum.photos/300/450';"
                >
            </div>
            <div class="card-info">
                <div class="card-title" title="${title}">${title}</div>
                <div class="card-meta">
                    <span class="badge">${language}</span>
                    <span class="rating"><i class="fas fa-star text-accent"></i> ${rating}</span>
                </div>
            </div>
        </div>
    `;
};

const attachMovieClickListeners = () => {
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const movieId = card.dataset.id;
            const movie = localMoviesData.find(m => m.id === movieId);
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

export const getMovieById = (id) => localMoviesData.find(m => m.id === id);
export const getMovieByTitleLoose = (titlePhrase) => {
    const lower = titlePhrase.toLowerCase();
    return localMoviesData.find(m => m.title.toLowerCase().includes(lower));
};
