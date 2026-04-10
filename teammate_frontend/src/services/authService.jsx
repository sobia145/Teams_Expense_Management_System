import api from './api';

const TOKEN_KEY = 'tems_auth_token';
const KNOWN_EMAILS_KEY = 'tems_known_emails';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const getStoredEmails = () => {
  try {
    const raw = localStorage.getItem(KNOWN_EMAILS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveStoredEmails = (emails) => {
  localStorage.setItem(KNOWN_EMAILS_KEY, JSON.stringify(emails));
};

const authService = {
  login: async (email, password) => {
    const fakeToken = btoa(`${email}:${password}`);
    localStorage.setItem(TOKEN_KEY, fakeToken);
    authService.rememberEmail(email);
    return api.post({ token: fakeToken });
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return api.post({ ok: true });
  },
  getToken: () => localStorage.getItem(TOKEN_KEY),
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  getKnownEmails: () => getStoredEmails(),
  rememberEmail: (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes('@')) {
      return getStoredEmails();
    }

    const current = getStoredEmails();
    const next = [normalized, ...current.filter((item) => item !== normalized)].slice(0, 10);
    saveStoredEmails(next);
    return next;
  }
};

export default authService;
