import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { theme } from './theme';
import './index.css';

// vuelca los colores/fonts del theme en variables CSS
const r = document.documentElement;
r.style.setProperty('--brand', theme.colors.brand);
r.style.setProperty('--brand-dark', theme.colors.brandDark);
r.style.setProperty('--bg', theme.colors.bg);
r.style.setProperty('--surface', theme.colors.surface);
r.style.setProperty('--ink', theme.colors.ink);
r.style.setProperty('--muted', theme.colors.muted);
r.style.setProperty('--border', theme.colors.border);
r.style.setProperty('--reward', theme.colors.reward);
r.style.setProperty('--reward-bg', theme.colors.rewardBg);
r.style.setProperty('--font-display', theme.fonts.display);
r.style.setProperty('--font-body', theme.fonts.body);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);