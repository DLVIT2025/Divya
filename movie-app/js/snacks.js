import { navigateTo } from './ui.js';
import { openBookingSummary } from './booking.js';

const SNACKS_DATA = [
    { id: 's1', name: 'Popcorn (Medium)', price: 120, icon: '🍿' },
    { id: 's2', name: 'Popcorn (Large)', price: 180, icon: '🍿' },
    { id: 's3', name: 'Coca Cola', price: 80, icon: '🥤' },
    { id: 's4', name: 'Nachos with Salsa', price: 150, icon: '🌮' },
    { id: 's5', name: 'Combo: Popcorn + Coke', price: 220, icon: '🍿+🥤' }
];

let currentSnacks = {};
let snacksTotal = 0;

let bookingData = {}; // to carry forward from seats

export const openSnacksSelection = (movie, seats, baseTotal) => {
    bookingData = { movie, seats, baseTotal };
    currentSnacks = {};
    
    // Init currentSnacks with default 0s
    SNACKS_DATA.forEach(s => currentSnacks[s.id] = 0);
    
    renderSnacksGrid();
    updateSnacksFooter();
    navigateTo('snacks-section');
};

const renderSnacksGrid = () => {
    const grid = document.getElementById('snacks-grid');
    grid.innerHTML = SNACKS_DATA.map(snack => `
        <div class="snack-card glass-panel" data-id="${snack.id}">
            <div class="snack-icon">${snack.icon}</div>
            <div class="snack-title">${snack.name}</div>
            <div class="snack-price">₹${snack.price}</div>
            <div class="snack-controls">
                <button class="qty-btn minus-btn" data-id="${snack.id}">-</button>
                <span class="qty-display" id="qty-${snack.id}">${currentSnacks[snack.id]}</span>
                <button class="qty-btn plus-btn" data-id="${snack.id}">+</button>
            </div>
        </div>
    `).join('');

    // Attach listeners
    grid.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', () => updateSnackQuantity(btn.dataset.id, 1));
    });
    grid.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', () => updateSnackQuantity(btn.dataset.id, -1));
    });
};

const updateSnackQuantity = (id, delta) => {
    if (currentSnacks[id] + delta >= 0) {
        currentSnacks[id] += delta;
        document.getElementById(`qty-${id}`).textContent = currentSnacks[id];
        updateSnacksFooter();
    }
};

export const incrementSnackByVoice = () => {
    // Default to adding a medium popcorn via voice
    updateSnackQuantity('s1', 1);
};

const updateSnacksFooter = () => {
    snacksTotal = 0;
    SNACKS_DATA.forEach(s => {
        snacksTotal += currentSnacks[s.id] * s.price;
    });

    document.getElementById('snacks-total').textContent = snacksTotal;
    document.getElementById('grand-total').textContent = (bookingData.baseTotal + snacksTotal);
};

document.addEventListener('DOMContentLoaded', () => {
    const proceedBtn = document.getElementById('proceed-checkout-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            const finalSnacksArr = [];
            SNACKS_DATA.forEach(s => {
                if (currentSnacks[s.id] > 0) {
                    finalSnacksArr.push({
                        ...s,
                        quantity: currentSnacks[s.id]
                    });
                }
            });

            openBookingSummary({
                ...bookingData,
                snacks: finalSnacksArr,
                snacksTotal: snacksTotal,
                grandTotal: bookingData.baseTotal + snacksTotal
            });
        });
    }
});
