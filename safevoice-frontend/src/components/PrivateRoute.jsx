// components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure this is installed: npm install jwt-decode

const PrivateRoute = ({ children, allowedRoles }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    // No token, redirect to login page
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(accessToken);
    const userRole = decodedToken.role;

    if (allowedRoles.includes(userRole)) {
      // User has an allowed role, render the children (the protected component)
      return children;
    } else {
      // User does not have an allowed role, redirect to an unauthorized page or home
      return <Navigate to="/" replace />; // Or '/unauthorized'
    }
  } catch (error) {
    console.error("Invalid token:", error);
    // Token is invalid (e.g., expired, malformed), clear it and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;