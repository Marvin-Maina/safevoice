import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import {Auth}
import { BrowserRouter as Router } from 'react-router-dom'; // Assuming you are using BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* Ensure your application is wrapped with Router */}
      <AuthProvider> {/* Wrap your App component with AuthProvider */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
