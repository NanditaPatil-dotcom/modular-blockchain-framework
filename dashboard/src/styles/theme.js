// Theme utilities and constants for the blockchain dashboard

export const themes = {
  dark: {
    primary: '#0f172a',
    secondary: '#1e293b',
    card: 'rgba(30, 41, 59, 0.8)',
    accent: {
      teal: '#2dd4bf',
      green: '#00ff88'
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8'
    },
    border: 'rgba(148, 163, 184, 0.2)'
  },
  light: {
    primary: '#f8fafc',
    secondary: '#ffffff',
    card: 'rgba(255, 255, 255, 0.9)',
    accent: {
      teal: '#0d9488',
      green: '#00cc66'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    },
    border: 'rgba(15, 23, 42, 0.1)'
  }
};

export const getCurrentTheme = () => {
  const saved = localStorage.getItem('theme');
  return saved || 'dark';
};

export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  document.documentElement.classList.toggle('light', theme === 'light');
};

export const toggleTheme = () => {
  const current = getCurrentTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
};

// Utility functions for consistent styling
export const getThemeColors = () => {
  const theme = getCurrentTheme();
  return themes[theme];
};

// Animation variants for framer-motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};