import { showToast, navigateTo } from './ui.js';

// Basic state
let currentUser = null;

// Helper to get/set users
const getUsers = () => JSON.parse(localStorage.getItem('ct_users')) || [];
const saveUsers = (users) => localStorage.setItem('ct_users', JSON.stringify(users));

// Simple hash for demo (inverts string essentially to hide it minimally)
const hashPassword = (pw) => btoa(pw);

export const initAuth = () => {
    // Check session
    const session = localStorage.getItem('ct_session');
    if (session) {
        // Find user
        const user = getUsers().find(u => u.email === session);
        if (user) {
            loginSession(user);
        }
    }

    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');
    const forgotPwLink = document.getElementById('forgot-password-link');

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const constPw = document.getElementById('login-password').value;
            
            // Email regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return showToast('Please enter a valid email address.', 'error');
            }

            const users = getUsers();
            const user = users.find(u => u.email === email);

            if (!user) {
                return showToast('Account not found. Please sign up.', 'error');
            }
            if (user.password !== hashPassword(constPw)) {
                return showToast('Incorrect password. Please try again.', 'error');
            }

            // Success
            loginSession(user);
            showToast(`Welcome back, ${user.name}!`, 'success');
            loginForm.reset();
            navigateTo('home-section');
        });
    }

    if(signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;

            // Simple validations
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return showToast('Please enter a valid email address.', 'error');
            }
            if (password.length < 6) {
                return showToast('Password must be at least 6 characters.', 'error');
            }

            const users = getUsers();
            if (users.find(u => u.email === email)) {
                return showToast('Email already registered! Please sign in.', 'error');
            }

            // Create user
            const newUser = {
                id: 'u_' + Date.now().toString(36),
                name,
                email,
                password: hashPassword(password),
                joined: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);

            loginSession(newUser);
            showToast(`Account created! Welcome to CineTicket, ${name}.`, 'success');
            signupForm.reset();
            navigateTo('home-section');
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('ct_session');
            updateNavState();
            showToast('You have been logged out.', 'info');
            navigateTo('home-section');
        });
    }

    if(forgotPwLink) {
        forgotPwLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt("Enter your registered email address to reset password:");
            if(email) {
                const finalEmail = email.trim().toLowerCase();
                const users = getUsers();
                const userIndex = users.findIndex(u => u.email === finalEmail);
                
                if (userIndex === -1) {
                    showToast("Email not found in our records.", 'error');
                } else {
                    const newPw = prompt("Enter your new password (min 6 chars):");
                    if (newPw && newPw.length >= 6) {
                        users[userIndex].password = hashPassword(newPw);
                        saveUsers(users);
                        showToast("Password updated successfully! You can now login.", 'success');
                    } else {
                        showToast("Invalid password. Must be at least 6 characters.", 'error');
                    }
                }
            }
        });
    }
};

const loginSession = (user) => {
    currentUser = user;
    localStorage.setItem('ct_session', user.email);
    updateNavState();
};

const updateNavState = () => {
    const authReqLinks = document.querySelectorAll('.auth-req');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const userProfileNav = document.getElementById('user-profile-nav');

    if (currentUser) {
        // Logged in
        authReqLinks.forEach(link => link.classList.remove('hidden'));
        loginNavBtn.classList.add('hidden');
        userProfileNav.classList.remove('hidden');
        
        document.getElementById('nav-username').textContent = currentUser.name;
        document.getElementById('nav-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
    } else {
        // Logged out
        authReqLinks.forEach(link => link.classList.add('hidden'));
        loginNavBtn.classList.remove('hidden');
        userProfileNav.classList.add('hidden');
    }
};

export const getCurrentUser = () => currentUser;
export const requireAuth = (callback) => {
    if (!currentUser) {
        showToast('Please sign in to access this feature.', 'info');
        navigateTo('auth-section');
        return false;
    }
    if (callback) callback();
    return true;
};
