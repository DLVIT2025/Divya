import { initTheme } from './theme.js';
import { isLoggedIn, loginWithCredentials, resetPasswordForEmail } from './auth.js';

initTheme();

const form = document.getElementById('login-form');
const errEl = document.getElementById('login-error');
const toastEl = document.getElementById('toast');

if (isLoggedIn()) {
  window.location.replace('index.html');
}

function showToast(msg, ms = 2800) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.hidden = true;
  }, ms);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errEl.hidden = true;
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    await loginWithCredentials(email, password);
    window.location.replace('index.html');
  } catch (err) {
    errEl.textContent = err.message || 'Sign in failed.';
    errEl.hidden = false;
  }
});

document.getElementById('btn-forgot').addEventListener('click', async () => {
  errEl.hidden = true;
  const email = window.prompt('Enter the email for your account:');
  if (email == null) return;
  const pw1 = window.prompt('Enter a new password (min 6 characters):');
  if (pw1 == null) return;
  const pw2 = window.prompt('Confirm new password:');
  if (pw2 == null) return;
  if (pw1 !== pw2) {
    showToast('Passwords do not match.');
    return;
  }
  try {
    await resetPasswordForEmail(email, pw1);
    showToast('Password updated. You can sign in now.');
  } catch (err) {
    showToast(err.message || 'Reset failed.');
  }
});
