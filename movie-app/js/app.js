import { initUI } from './ui.js';
import { initAuth } from './auth.js';
import { renderMovies, initMovieFilters } from './movies.js';
import { initVoice } from './voice.js';
import { initSocial } from './social.js';
import { fetchMovies, seedInitialData } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize common UI patterns
    initUI();
    
    // Initialize Auth (Checks Firebase state and updates Navbar)
    initAuth();
    
    // Seed initial data if DB is empty (for demo/first run)
    await seedInitialData();

    // Fetch and render movies from Firestore
    const movies = await fetchMovies();
    renderMovies(movies);
    
    initMovieFilters();
    
    // Initialize Voice Commands
    initVoice();
    
    // Initialize Social / Community
    initSocial();
    
    // Small logic to auto-route to Home
    document.querySelector('.nav-link[data-target="home-section"]').click();
});
