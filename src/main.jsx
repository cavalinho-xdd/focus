import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/700.css';
import './styles/index.css';

window.addEventListener('error', (event) => {
  document.body.innerHTML = `<div style="color:red;padding:20px;font-family:monospace">
    <h3>Runtime Error</h3>
    <pre>${event.error?.stack || event.message}</pre>
  </div>`;
});

window.addEventListener('unhandledrejection', (event) => {
  document.body.innerHTML = `<div style="color:red;padding:20px;font-family:monospace">
    <h3>Unhandled Promise Rejection</h3>
    <pre>${event.reason?.stack || event.reason}</pre>
  </div>`;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
