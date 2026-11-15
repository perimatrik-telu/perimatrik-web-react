import "./i18n";

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS first
import './index.css' // Then custom CSS
import "swiper/css";
import "swiper/css/navigation";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core"; // Font Awesome config
import App from './App.tsx'

config.autoAddCss = false; // Configure Font Awesome

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        let hasRefreshed = false;

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (hasRefreshed) {
            return;
          }

          hasRefreshed = true;
          window.location.reload();
        });

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('A new version is available. Refreshing to update the app shell.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  });
}

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
