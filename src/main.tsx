import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
      scheduleMorningNotification(registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

function scheduleMorningNotification(registration: ServiceWorkerRegistration) {
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setHours(6, 0, 0, 0);

  if (now.getTime() > targetTime.getTime()) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntil6AM = targetTime.getTime() - now.getTime();

  setTimeout(() => {
    registration.showNotification('Morning Digest Ready', {
      body: 'Your daily morning digest is ready to view.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png'
    });
    // Reschedule for next day
    scheduleMorningNotification(registration);
  }, timeUntil6AM);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
