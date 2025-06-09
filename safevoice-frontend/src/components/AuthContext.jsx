// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Make sure you have jwt-decode installed
import axios from 'axios'; // For API calls
import { Loader2 } from 'lucide-react'; // IMPORTANT: Ensure Loader2 is imported here

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null); // <--- NEW: State to store the user object
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  // Function to decode token and set user state
  const decodeAndSetUser = useCallback((token) => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAuthenticated(true);
        setUserRole(decodedToken.role);
        setUser(decodedToken); // <--- MODIFIED: Set the user object here
        return decodedToken; // Return decoded token for further use if needed
      } catch (error) {
        console.error("Failed to decode token:", error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null); // <--- NEW: Clear user on error
        return null;
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null); // <--- NEW: Clear user if no token
      return null;
    }
  }, []);

  // Function to refresh access token
  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken) {
      console.log("No refresh token available. Logging out.");
      // If logout function is not in scope, you might need to call it from context or pass it
      // For now, let's replicate the logout logic directly
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null); // <--- NEW: Clear user on no refresh token
      setLoading(false); // Ensure loading is stopped
      return false;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/accounts/token/refresh/', {
        refresh: refreshToken,
      });
      const newAccessToken = response.data.access;
      const newRefreshToken = response.data.refresh; // New refresh token if provided

      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        setRefreshToken(newRefreshToken);
      }
      decodeAndSetUser(newAccessToken); // Re-decode with new access token
      console.log("Access token refreshed successfully.");
      setLoading(false); // Ensure loading is stopped after success
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error.response?.data || error.message);
      // Replicate logout logic directly here as well
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null); // <--- NEW: Clear user on refresh failure
      setLoading(false); // Ensure loading is stopped after failure
      return null;
    }
  }, [refreshToken, decodeAndSetUser]); // Depend on refreshToken and decodeAndSetUser

  // Initial check and token refresh on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true); // Start loading at the beginning of auth check
      if (accessToken) {
        const decoded = decodeAndSetUser(accessToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          // Token is valid and not expired
          setIsAuthenticated(true);
          setUserRole(decoded.role);
          // User object is already set by decodeAndSetUser
        } else {
          // Token expired or invalid, try refreshing
          console.log("Access token expired or invalid. Attempting refresh...");
          await refreshAuthToken();
        }
      } else if (refreshToken) {
        // No access token but has refresh token, try refreshing
        console.log("No access token. Attempting refresh using refresh token...");
        await refreshAuthToken();
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null); // <--- NEW: Clear user if no token (no access or refresh)
      }
      setLoading(false); // Stop loading at the end of auth check
    };

    checkAuth();

    // Set up interval for proactive token refresh (e.g., every 4 minutes if token expires in 5)
    // Adjust interval based on your JWT access token's expiry time
    const refreshInterval = setInterval(async () => {
      if (isAuthenticated && accessToken) {
        try { // Add try-catch around jwtDecode to handle potential errors
          const decoded = jwtDecode(accessToken);
          // Refresh if token expires in less than 1 minute (60 seconds)
          if (decoded.exp * 1000 - Date.now() < 60 * 1000) {
            console.log("Access token nearing expiry, refreshing...");
            await refreshAuthToken();
          }
        } catch (error) {
          console.error("Error decoding access token in refresh interval:", error);
          // If token is invalid, force a refresh attempt or logout
          await refreshAuthToken();
        }
      }
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(refreshInterval); // Cleanup interval
  }, [accessToken, refreshToken, isAuthenticated, refreshAuthToken, decodeAndSetUser]);


  const login = useCallback((access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    decodeAndSetUser(access); // This will set isAuthenticated, userRole, and user
  }, [decodeAndSetUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null); // <--- NEW: Clear user on logout
    // Optionally redirect to login page
    // window.location.href = '/login'; // Or use navigate from react-router-dom if available
  }, []);

  const value = {
    isAuthenticated,
    userRole,
    user, // <--- NEW: Provide the user object
    accessToken,
    refreshToken,
    loading,
    login,
    logout,
    refreshAuthToken, // Expose refresh function if needed elsewhere
  };

  if (loading) {
    // Display a loading spinner while authentication state is being determined
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Initializing authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) { // Changed !context to context === null for stricter check
    // This error means useAuth was called outside of an AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};