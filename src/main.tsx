import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="bottom-right" toastOptions={{
      className: 'font-sans font-medium rounded-2xl shadow-xl border border-slate-100',
      success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
      error: { iconTheme: { primary: '#ef4444', secondary: 'white' } }
    }} />
  </StrictMode>
);
