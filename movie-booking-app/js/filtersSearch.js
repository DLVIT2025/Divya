import { MOVIES } from './movies.js';

export function getUniqueLanguages() {
  return [...new Set(MOVIES.map((m) => m.language))].sort();
}

export function getUniqueGenres() {
  return [...new Set(MOVIES.map((m) => m.genre))].sort();
}

export function filterMovies(filters) {
  const q = (filters.search || '').trim().toLowerCase();
  const lang = filters.language || '';
  const genre = filters.genre || '';
  return MOVIES.filter((m) => {
    if (lang && m.language !== lang) return false;
    if (genre && m.genre !== genre) return false;
    if (q && !m.title.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
