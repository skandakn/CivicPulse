import { createContext, useContext } from 'react';
import { AuthUserProfile } from '../types';

export interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  isDemoBypass: boolean;
  isClerkAvailable: boolean;
  user: AuthUserProfile | null;
  isAuthModalOpen: boolean;
  authModalTab: 'sign-in' | 'sign-up';
  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthModal: () => void;
  enableDemoBypass: () => void;
  disableDemoBypass: () => void;
  signOut: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthSession = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthSession must be used within a ClerkAuthProvider');
  }
  return context;
};
