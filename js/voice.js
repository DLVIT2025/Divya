import { showToast, navigateTo } from './ui.js';
import { getMovieByTitleLoose } from './movies.js';
import { openMovieDetail } from './movieDetail.js';
import { incrementSnackByVoice } from './snacks.js';

let recognition;
let isListening = false;

export const initVoice = () => {
    const micBtn = document.getElementById('voice-btn');
    const overlay = document.getElementById('voice-overlay');
    const manualInput = document.getElementById('manual-voice-cmd');

    // Manual Keyboard Fallback for Voice Commands (In case of Mic hardware failure)
    if (manualInput) {
        manualInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && manualInput.value.trim() !== '') {
                const transcript = manualInput.value.trim().toLowerCase();
                document.getElementById('voice-status').textContent = `"${transcript}"`;
                manualInput.value = ''; // clear
                setTimeout(() => {
                    processCommand(transcript);
                    stopListening();
                }, 500);
            }
        });
    }

    // Click overlay to cancel
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) stopListening();
        });
    }

    // Check support
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (isListening) return stopListening();
                try {
                    recognition.start();
                    isListening = true;
                    overlay.classList.remove('hidden');
                    if(manualInput) manualInput.focus();
                } catch(e) {
                    console.error("Speech Recog Error:", e);
                }
            });
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            document.getElementById('voice-status').textContent = `"${transcript}"`;
            
            setTimeout(() => {
                processCommand(transcript);
                stopListening();
            }, 1000);
        };

        recognition.onerror = (event) => {
            let errorMsg = event.error;
            if (errorMsg === 'network') errorMsg = 'Network blocked or lack of HTTPS';
            if (errorMsg === 'not-allowed') errorMsg = 'Mic permission blocked by browser';
            if (errorMsg === 'no-speech') errorMsg = 'No speech heard';
            showToast(`Mic issue: ${errorMsg}. Type command instead!`, 'error');
            // Do not stop listening entirely if they want to type
            if(manualInput) manualInput.focus();
        };

        recognition.onend = () => {
            // Only toggle state, let overlay remain until processCommand or manual cancel
            isListening = false;
        };

    } else {
        // Not supported - Still allow manual typing simulation
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                overlay.classList.remove('hidden');
                document.getElementById('voice-status').textContent = `Speech API Not Supported`;
                if(manualInput) {
                    manualInput.placeholder = "Speech API failed. Type command here!";
                    manualInput.focus();
                }
            });
        }
        console.warn("Speech recognition not natively supported. Using text fallback.");
    }
};

const stopListening = () => {
    isListening = false;
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    document.getElementById('voice-overlay').classList.add('hidden');
    document.getElementById('voice-status').textContent = 'Listening for "Select [Movie]" or "Book Tickets"...';
};

const processCommand = (cmd) => {
    if (cmd.includes('select') || cmd.includes('play') || cmd.includes('show')) {
        let titlePortion = cmd.replace(/select|play|show|movie/g, '').trim();
        if (titlePortion) {
            const movie = getMovieByTitleLoose(titlePortion);
            if (movie) {
                showToast(`Opening ${movie.title}`, 'success');
                openMovieDetail(movie);
            } else {
                showToast(`Could not find a movie named ${titlePortion}`, 'error');
            }
        }
    } else if (cmd.includes('book ticket')) {
        navigateTo('movies-section');
        showToast('Please select a movie to book.', 'info');
    } else if (cmd.includes('popcorn') || cmd.includes('snack')) {
        incrementSnackByVoice();
        showToast('Added Popcorn!', 'success');
    } else if (cmd.includes('home')) {
        navigateTo('home-section');
    } else if (cmd.includes('my tickets')) {
        navigateTo('my-tickets-section');
    } else if (cmd.includes('social') || cmd.includes('friends')) {
        navigateTo('social-section');
    } else {
        showToast("Command not recognized. Try 'Select Leo' or 'Book Tickets'.", 'error');
    }
};
