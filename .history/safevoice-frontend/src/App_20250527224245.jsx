import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import { useEffect, useState } from 'react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for token
    setIsLoggedIn(!!localStorage.getItem('access'));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Only show navbar if logged in */}
        {isLoggedIn && (
          <nav className="bg-teal-700 p-4">
            <p>🎉 You're logged in!</p>
          </nav>
        )}

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}
