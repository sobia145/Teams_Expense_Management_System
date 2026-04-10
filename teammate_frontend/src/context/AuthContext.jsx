import { createContext, useMemo, useState } from 'react';
import { userService } from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Global Secure State Container natively holding the Java DB Object
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    console.log("AuthContext routing secure login to Java Backend...");
    
    // Uses the API Mapper to hit http://localhost:8080/api/users/login
    const authResponse = await userService.login({ email, passwordHash: password });
    
    // Save the newly generated JWT token for subsequent protected requests!
    if (authResponse.token) {
        localStorage.setItem('jwtToken', authResponse.token);
    }
    
    // Extract the inner 'user' JSON object from the new AuthResponse payload
    const realJavaUser = authResponse.user || authResponse;
    
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
