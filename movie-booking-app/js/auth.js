import { createSalt, hashPassword, verifyPassword } from './auth/crypto.js';

const USERS_KEY = 'mtb_users_v1';
const SESSION_KEY = 'mtb_session_v1';

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getUsers() {
  return safeParse(localStorage.getItem(USERS_KEY), []);
}

function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

export function getSessionUserId() {
  return localStorage.getItem(SESSION_KEY) || '';
}

export function setSessionUserId(id) {
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

export function normalizeUsername(u) {
  return (u || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

function stripUser(u) {
  if (!u) return null;
  const { passwordHash, salt, ...rest } = u;
  return rest;
}

export function getUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

export function getUserByEmail(email) {
  const em = (email || '').trim().toLowerCase();
  return getUsers().find((u) => u.email === em) || null;
}

export function getUserByUsername(username) {
  const un = normalizeUsername(username);
  return getUsers().find((u) => u.username === un) || null;
}

export function getCurrentUser() {
  const id = getSessionUserId();
  if (!id) return null;
  return stripUser(getUserById(id));
}

export function isLoggedIn() {
  return Boolean(getCurrentUser());
}

export async function registerUser({ email, username, displayName, password }) {
  if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');
  const pw = (password || '').trim();
  if (pw.length < 6) throw new Error('Password must be at least 6 characters.');
  const un = normalizeUsername(username);
  if (un.length < 3) throw new Error('Username must be at least 3 letters or numbers.');
  const name = (displayName || '').trim();
  if (!name) throw new Error('Display name is required.');

  const users = getUsers();
  const em = email.trim().toLowerCase();
  if (users.some((u) => u.email === em)) throw new Error('This email is already registered.');
  if (users.some((u) => u.username === un)) throw new Error('This username is already taken.');

  const salt = await createSalt();
  const passwordHash = await hashPassword(pw, salt);
  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    email: em,
    username: un,
    displayName: name,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  setSessionUserId(user.id);
  return stripUser(user);
}

export async function loginWithCredentials(email, password) {
  const user = getUserByEmail(email);
  if (!user) throw new Error('Wrong email or password.');
  const ok = await verifyPassword(password, user.salt, user.passwordHash);
  if (!ok) throw new Error('Wrong email or password.');
  setSessionUserId(user.id);
  return stripUser(user);
}

export async function resetPasswordForEmail(email, newPassword) {
  if (!isValidEmail(email)) throw new Error('Invalid email.');
  const pw = (newPassword || '').trim();
  if (pw.length < 6) throw new Error('Password must be at least 6 characters.');
  const users = getUsers();
  const em = email.trim().toLowerCase();
  const idx = users.findIndex((u) => u.email === em);
  if (idx < 0) throw new Error('No account found for that email.');
  const salt = await createSalt();
  const passwordHash = await hashPassword(pw, salt);
  users[idx] = { ...users[idx], salt, passwordHash };
  saveUsers(users);
}

export function logoutSession() {
  setSessionUserId('');
}
