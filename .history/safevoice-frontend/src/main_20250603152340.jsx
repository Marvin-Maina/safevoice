import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter as Router

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* This is the ONLY place <Router> should be in your application */}
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
