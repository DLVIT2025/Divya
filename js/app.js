import { initUI } from './ui.js';
import { initAuth } from './auth.js';
import { renderMovies, initMovieFilters } from './movies.js';
import { initVoice } from './voice.js';
import { initAdmin } from './admin.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize common UI patterns
    initUI();
    
    // Initialize Auth (Checks local storage and updates Navbar)
    initAuth();
    
    // Initialize Movie Catalog
    renderMovies();
    initMovieFilters();
    
    // Initialize Voice Commands
    initVoice();
    
    // Initialize Admin
    initAdmin();
    
    // Small logic to auto-route to Home
    document.querySelector('.nav-link[data-target="home-section"]').click();
});
