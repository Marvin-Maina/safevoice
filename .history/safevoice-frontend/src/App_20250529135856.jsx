import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Navbar from './components/navbar';
import LandingPage from './pages/landingpage';
export default function App() {
  return (
    <Router>
       <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Navbar /> {/*  Sticky navbar always visible */}
        <div className="pt-16 flex-grow"> {/*  Add padding to avoid overlap */}
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
