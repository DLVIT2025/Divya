import { initUI } from './ui.js';
import { initAuth } from './auth.js';
import { renderMovies, initMovieFilters, fetchMoviesByCity } from './movies.js';
import { initVoice } from './voice.js';
import { initPeopleSection } from './theatres.js';

const initCityModal = () => {
    const modal = document.getElementById('city-modal');
    const navCityBtn = document.getElementById('nav-city-selector');
    const navCityName = document.getElementById('nav-city-name');
    if(!modal) return;
    
    const cityCards = document.querySelectorAll('.city-card');
    const searchInput = document.getElementById('city-search-input');
    const detectBtn = document.getElementById('detect-location-btn');
    
    // Bind Selection Function
    const selectCity = (city) => {
        localStorage.setItem('ct_city', city);
        if(navCityName) navCityName.textContent = city;
        modal.classList.add('hidden');
        modal.classList.remove('d-flex');
        
        // Trigger responsive fetch when city changes
        fetchMoviesByCity(city);
    };
    
    // Check if city exists on load
    const savedCity = localStorage.getItem('ct_city');
    if(savedCity) {
        if(navCityName) navCityName.textContent = savedCity;
        modal.classList.add('hidden');
        modal.classList.remove('d-flex');
    } else {
        // Enforce modal
        modal.classList.remove('hidden');
        modal.classList.add('d-flex');
    }
    
    // Toggle Modal from Navbar
    if(navCityBtn) {
        navCityBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('d-flex');
        });
    }
    
    // Event listeners
    cityCards.forEach(card => card.addEventListener('click', () => selectCity(card.dataset.city)));
    
    if(searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter' && searchInput.value.trim()) {
                selectCity(searchInput.value.trim());
            }
        });
    }
    
    if(detectBtn) {
        detectBtn.addEventListener('click', () => selectCity('Mumbai')); // Fallback
    }
    
    const viewAllBtn = document.getElementById('view-all-cities-btn');
    if(viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('More cities coming soon!');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initCityModal();
    initUI();
    initAuth();
    initPeopleSection();
    renderMovies();
    initMovieFilters();
    initVoice();
    
    // Auto-route to Home
    const homeLink = document.querySelector('.nav-link[data-target="home-section"]');
    if(homeLink) homeLink.click();
});

