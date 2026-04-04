import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import PwaUpdater from './components/PwaUpdater.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <PwaUpdater />
  </React.StrictMode>
);
