import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Navbar from './components/navbar';
import Footer from './components/footer';
import LandingPage from './pages/landingpage';
import About from './components/about';
import BecomeAdmin from './pages/becomeadmin';
import FreeAdminDashboard from './pages/freeadmindashboard';
import PrivateRoute from './components/PrivateRoute'; // Import the PrivateRoute component
import Profile from './pages/profile';
import EditProfile from './pages/EditProfile';
import 
// A wrapper that shows the navbar only on "/"
const AppLayout = () => {
  const location = useLocation();
  const showNavbar = location.pathname === '/';
  const showFooter = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {showNavbar && <Navbar />}
      <div className={`${showNavbar ? 'pt-16' : ''} flex-grow`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/become-admin" element={<BecomeAdmin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/EditProfile" element={<EditProfile />} />

          {/* Protected Admin Dashboard Route */}
          <Route
            path="/free-admin-dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <FreeAdminDashboard />
              </PrivateRoute>
            }
          />
          {/* Add more routes as needed */}
        </Routes>
      </div>
      {showFooter && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}