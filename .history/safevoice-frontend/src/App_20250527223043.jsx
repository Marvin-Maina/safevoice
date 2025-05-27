import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/';

export default function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen text-teal-400 font-sans">
        <nav className="flex justify-center gap-8 py-6 bg-blue-900 border-b border-teal-600">
          <Link to="/register" className="hover:text-teal-300 transition">Register</Link>
          <Link to="/login" className="hover:text-teal-300 transition">Login</Link>
        </nav>
        
        <main className="max-w-xl mx-auto p-6">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Register />} /> {/* default to Register */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
