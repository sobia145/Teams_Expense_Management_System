import { createContext, useMemo, useState } from 'react';
import { userService } from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Global Secure State Container natively holding the Java DB Object
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    console.log("AuthContext routing secure login to Java Backend...");
    
    // Uses the API Mapper to hit /api/auth/login
    const authResponse = await userService.login({ email, password });
    
    // Save the newly generated JWT token for subsequent protected requests!
    if (authResponse.token) {
        localStorage.setItem('jwtToken', authResponse.token);
    }
    
    // Extract the inner 'user' JSON object from the new AuthResponse payload
    const realJavaUser = authResponse.user || authResponse;
    
    // IDENTITY SYNC FIX: Ensure userId is the master property used across the app
    if (!realJavaUser.userId && realJavaUser.id) {
        realJavaUser.userId = realJavaUser.id;
    }
    
    // Inject the real MySQL user directly into React's global nervous system!
    setUser(realJavaUser);
    
    return realJavaUser;
  };

  const logout = () => {
    // Clear state
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: Boolean(user) }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
