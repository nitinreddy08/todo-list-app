import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const API_BASE_URL = "https://nitin-flask-backend-todo.onrender.com/api";

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the AuthProvider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  // Check for user session on component mount
  useEffect(() => {
    checkUserSession();
  }, []);

  // Function to check if a user is logged in via a session cookie
  const checkUserSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check_session`, {
        credentials: "include", // Must include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data); // Set user data if session is valid
      } else {
        setUser(null); // No valid session
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setLoading(false); // Stop loading once check is complete
    }
  };

  // Register function
  const register = async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include",
    });

    if (response.ok) {
      // Backend now logs us in and returns the user data directly.
      const userData = await response.json();
      setUser(userData); // Set the user state
      router.push("/"); // Redirect to home
    } else {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Registration failed");
    }
  };

  // Login function
  const login = async (identifier, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      credentials: "include",
    });

    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      router.push("/");
    } else {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Login failed");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        credentials: "include",
      });
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        setUser(null); // Clear user state on the frontend
        router.push("/login"); // Redirect to login page
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user, // A handy boolean to check if user is logged in
  };

  // Provide the context value to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Create a custom hook for easy context consumption
export function useAuth() {
  return useContext(AuthContext);
}