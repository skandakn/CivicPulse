import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { AuthUserProfile } from '../../types';
import { clerkAppearance } from './clerkAppearance';

interface ClerkAuthProviderProps {
  children: ReactNode;
}

// Error Boundary to prevent Clerk initialization crashes from breaking the presentation
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ClerkErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[CivicPulse] Clerk initialization error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

// Bridge component that accesses Clerk hooks inside <ClerkProvider>
const ClerkAuthBridge: React.FC<{
  children: ReactNode;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'sign-in' | 'sign-up';
  setAuthModalTab: (tab: 'sign-in' | 'sign-up') => void;
  isDemoBypass: boolean;
  setIsDemoBypass: (bypass: boolean) => void;
}> = ({
  children,
  isAuthModalOpen,
  setIsAuthModalOpen,
  authModalTab,
  setAuthModalTab,
  isDemoBypass,
  setIsDemoBypass
}) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const handleSignOut = async () => {
    try {
      if (isSignedIn) {
        await clerkSignOut();
      }
    } catch (err) {
      console.warn('[CivicPulse] Sign-out warning:', err);
    }
    setIsDemoBypass(false);
    sessionStorage.removeItem('civicpulse_demo_bypass');
  };

  const user: AuthUserProfile | null = clerkUser
    ? {
        id: clerkUser.id,
        fullName: clerkUser.fullName || clerkUser.username || clerkUser.firstName || 'Citizen Reporter',
        firstName: clerkUser.firstName || 'Citizen',
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        imageUrl: clerkUser.imageUrl || null,
        role: 'CITIZEN'
      }
    : isDemoBypass
    ? {
        id: 'guest-judge-session',
        fullName: 'Guest Judge',
        firstName: 'Judge',
        email: 'judge@civicpulse.blr',
        imageUrl: null,
        role: 'CHIEF_COMMISSIONER'
      }
    : null;

  const authContextValue: AuthContextType = {
    isLoaded: isLoaded,
    isSignedIn: Boolean(isSignedIn || isDemoBypass),
    isDemoBypass,
    isClerkAvailable: true,
    user,
    isAuthModalOpen,
    authModalTab,
    openSignIn: () => {
      setAuthModalTab('sign-in');
      setIsAuthModalOpen(true);
    },
    openSignUp: () => {
      setAuthModalTab('sign-up');
      setIsAuthModalOpen(true);
    },
    closeAuthModal: () => setIsAuthModalOpen(false),
    enableDemoBypass: () => {
      setIsDemoBypass(true);
      sessionStorage.setItem('civicpulse_demo_bypass', 'true');
      setIsAuthModalOpen(false);
    },
    disableDemoBypass: () => {
      setIsDemoBypass(false);
      sessionStorage.removeItem('civicpulse_demo_bypass');
    },
    signOut: handleSignOut,
    error: null
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Resilient Fallback Provider when Clerk key is missing or offline
const FallbackAuthProvider: React.FC<{
  children: ReactNode;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'sign-in' | 'sign-up';
  setAuthModalTab: (tab: 'sign-in' | 'sign-up') => void;
  isDemoBypass: boolean;
  setIsDemoBypass: (bypass: boolean) => void;
  error?: string | null;
}> = ({
  children,
  isAuthModalOpen,
  setIsAuthModalOpen,
  authModalTab,
  setAuthModalTab,
  isDemoBypass,
  setIsDemoBypass,
  error = null
}) => {
  const user: AuthUserProfile | null = isDemoBypass
    ? {
        id: 'guest-judge-session',
        fullName: 'Guest Judge (Demo Mode)',
        firstName: 'Judge',
        email: 'judge@civicpulse.blr',
        imageUrl: null,
        role: 'CHIEF_COMMISSIONER'
      }
    : null;

  const authContextValue: AuthContextType = {
    isLoaded: true,
    isSignedIn: isDemoBypass,
    isDemoBypass,
    isClerkAvailable: false,
    user,
    isAuthModalOpen,
    authModalTab,
    openSignIn: () => {
      setAuthModalTab('sign-in');
      setIsAuthModalOpen(true);
    },
    openSignUp: () => {
      setAuthModalTab('sign-up');
      setIsAuthModalOpen(true);
    },
    closeAuthModal: () => setIsAuthModalOpen(false),
    enableDemoBypass: () => {
      setIsDemoBypass(true);
      sessionStorage.setItem('civicpulse_demo_bypass', 'true');
      setIsAuthModalOpen(false);
    },
    disableDemoBypass: () => {
      setIsDemoBypass(false);
      sessionStorage.removeItem('civicpulse_demo_bypass');
    },
    signOut: async () => {
      setIsDemoBypass(false);
      sessionStorage.removeItem('civicpulse_demo_bypass');
    },
    error
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [isDemoBypass, setIsDemoBypass] = useState(() => {
    return sessionStorage.getItem('civicpulse_demo_bypass') === 'true';
  });

  const publishableKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no publishable key is present, run in resilient fallback mode
  if (!publishableKey || publishableKey.includes('your_clerk_publishable_key')) {
    return (
      <FallbackAuthProvider
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        authModalTab={authModalTab}
        setAuthModalTab={setAuthModalTab}
        isDemoBypass={isDemoBypass}
        setIsDemoBypass={setIsDemoBypass}
        error="Clerk publishable key is not set. Running in resilient Demo Mode."
      >
        {children}
      </FallbackAuthProvider>
    );
  }

  return (
    <ClerkErrorBoundary
      fallback={(error) => (
        <FallbackAuthProvider
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          authModalTab={authModalTab}
          setAuthModalTab={setAuthModalTab}
          isDemoBypass={isDemoBypass}
          setIsDemoBypass={setIsDemoBypass}
          error={`Clerk offline fallback: ${error.message}`}
        >
          {children}
        </FallbackAuthProvider>
      )}
    >
      <ClerkProvider publishableKey={publishableKey} appearance={clerkAppearance}>
        <ClerkAuthBridge
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          authModalTab={authModalTab}
          setAuthModalTab={setAuthModalTab}
          isDemoBypass={isDemoBypass}
          setIsDemoBypass={setIsDemoBypass}
        >
          {children}
        </ClerkAuthBridge>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
};
