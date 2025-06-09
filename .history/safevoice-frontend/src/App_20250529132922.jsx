import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <div className="flex-grow">
          na
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
