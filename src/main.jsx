import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './styles/index.css'
import logger from './utils/logger.js'

registerSW({
  immediate: true,
  onRegistered(registration) {
    if (!registration) return;
    window.setInterval(() => {
      registration.update().catch((error) => {
        logger.warn('Failed to check for service worker updates:', error);
      });
    }, 1000 * 60 * 30);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
