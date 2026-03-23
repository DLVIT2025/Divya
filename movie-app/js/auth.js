import { showToast, navigateTo } from './ui.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, db } from './firebase-service.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Basic state
let currentUser = null;

export const initAuth = () => {
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : { name: user.displayName, email: user.email };
            loginSession({ ...userData, uid: user.uid });
        } else {
            // User is signed out
            currentUser = null;
            updateNavState();
        }
    });

    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');
    const forgotPwLink = document.getElementById('forgot-password-link');

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            
            try {
                await signInWithEmailAndPassword(auth, email, password);
                showToast(`Welcome back!`, 'success');
                loginForm.reset();
                navigateTo('home-section');
            } catch (error) {
                console.error("Login Error:", error);
                let msg = "Login failed. Please check your credentials.";
                if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    msg = "Incorrect email or password. Please try again.";
                } else if (error.code === 'auth/configuration-not-found') {
                    msg = "Authentication is not enabled in Firebase Console. Please enable Email/Password login.";
                }
                showToast(msg, 'error');
            }
        });
    }

    if(signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;

            if (password.length < 6) {
                return showToast('Password must be at least 6 characters.', 'error');
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update profile display name
                await updateProfile(user, { displayName: name });

                // Save user data to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: email,
                    createdAt: new Date().toISOString()
                });

                showToast(`Account created! Welcome, ${name}.`, 'success');
                signupForm.reset();
                navigateTo('home-section');
            } catch (error) {
                console.error("Signup Error:", error);
                let msg = "Signup failed. Please try again.";
                if (error.code === 'auth/email-already-in-use') {
                    msg = "Email is already registered. Please login.";
                } else if (error.code === 'auth/weak-password') {
                    msg = "Password is too weak. Min 6 chars.";
                } else if (error.code === 'auth/configuration-not-found') {
                    msg = "Authentication is not enabled in Firebase Console. Please enable Email/Password login.";
                }
                showToast(msg, 'error');
            }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                showToast('You have been logged out.', 'info');
                navigateTo('home-section');
            } catch (error) {
                showToast('Logout failed.', 'error');
            }
        });
    }

    if(forgotPwLink) {
        forgotPwLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = prompt("Enter your registered email address to reset password:");
            if(email) {
                try {
                    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
                    showToast("Password reset email sent! Please check your inbox.", 'success');
                } catch (error) {
                    showToast("Failed to send reset email. Please ensure the email is correct.", 'error');
                }
            }
        });
    }
};

const loginSession = (user) => {
    currentUser = user;
    updateNavState();
    
    // Populate account section
    const accountName = document.getElementById('account-name');
    const accountEmail = document.getElementById('account-email');
    const accountAvatar = document.getElementById('account-avatar');
    
    if (accountName) accountName.textContent = user.name;
    if (accountEmail) accountEmail.textContent = user.email;
    if (accountAvatar) accountAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    // Redirect to Account if current page is Auth
    const activeSection = document.querySelector('.page-section:not(.hidden)');
    if (activeSection && activeSection.id === 'auth-section') {
        navigateTo('my-account-section');
    }
};

const updateNavState = () => {
    const authReqLinks = document.querySelectorAll('.auth-req');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const userProfileNav = document.getElementById('user-profile-nav');

    if (currentUser) {
        authReqLinks.forEach(link => link.classList.remove('hidden'));
        loginNavBtn.classList.add('hidden');
        userProfileNav.classList.remove('hidden');
        
        document.getElementById('nav-username').textContent = currentUser.name;
        document.getElementById('nav-avatar').textContent = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
        
        // Sync account section if visible
        const accountName = document.getElementById('account-name');
        const accountEmail = document.getElementById('account-email');
        if (accountName) accountName.textContent = currentUser.name;
        if (accountEmail) accountEmail.textContent = currentUser.email;
    } else {
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
