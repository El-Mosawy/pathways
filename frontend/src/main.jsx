// Simply put, main.jsx is the entry point of the React application. It is responsible for rendering the main App component into the DOM. 
// It also imports global CSS styles and wraps the App component in StrictMode to help identify potential problems in the app during development.

import { StrictMode } from 'react' // Tool for highlighting potential problems in an application. It activates additional checks and warnings for its descendants.
import { createRoot } from 'react-dom/client'
import './index.css' // Import global CSS styles which is applied to every single component in the app
import App from './App.jsx' // Import the main App component

createRoot(document.getElementById('root')).render( // Render the App component inside the StrictMode component to help identify potential problems in the app and provides additional warnings in development mode.
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration)
      })
      .catch(error => {
        console.log('SW registration failed:', error)
      })
  })
}