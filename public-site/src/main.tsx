import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import slick carousel styles from npm package
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// Import our custom styles
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

