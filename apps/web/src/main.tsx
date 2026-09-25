import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import './theme/tokens.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Не найден #root');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
