import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'authToken';

interface AuthContextType {
  authToken: string | null;
  isLoading: boolean; // To handle async token loading
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  setAuthStateFromExternal: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // --- TEMPORARY BYPASS: Start with a fake token and not loading ---
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // -----------------------------------------------------------------

  // Comment out the initial token loading useEffect
  /*
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (storedToken) {
          console.log('[AuthContext] Token found in storage.');
          setAuthToken(storedToken);
        } else {
          console.log('[AuthContext] No token found in storage.');
        }
      } catch (e) {
        console.error('[AuthContext] Failed to load token:', e);
        setAuthToken(null);
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {});
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);
  */

  // signIn and signOut still modify the state, but initial state is overridden
  const signIn = async (token: string) => {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      setAuthToken(token);
      console.log('[AuthContext] Signed in, token stored.');
    } catch (e) {
      console.error('[AuthContext] Failed to save token:', e);
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      setAuthToken(null);
      console.log('[AuthContext] Signed out, token removed.');
    } catch (e) {
      console.error('[AuthContext] Failed to remove token:', e);
    }
  };

  const setAuthStateFromExternal = (token: string | null) => {
    console.log(`[AuthContext] Setting auth state externally: ${token ? 'Token Received' : 'Null'}`);
    setAuthToken(token);
  };

  const value = {
    authToken,
    isLoading,
    signIn,
    signOut,
    setAuthStateFromExternal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 