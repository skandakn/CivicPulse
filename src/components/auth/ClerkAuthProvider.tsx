import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
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
  clerkKey: string;
  setClerkKey: (key: string) => void;
}> = ({
  children,
  isAuthModalOpen,
  setIsAuthModalOpen,
  authModalTab,
  setAuthModalTab,
  isDemoBypass,
  setIsDemoBypass,
  clerkKey,
  setClerkKey
}) => {
  const { isLoaded, isSignedIn: isClerkSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const [mockUser, setMockUser] = useState<AuthUserProfile | null>(() => {
    const saved = sessionStorage.getItem('civicpulse_mock_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return null;
  });

  useEffect(() => {
    if (isClerkSignedIn && isAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
  }, [isClerkSignedIn, isAuthModalOpen, setIsAuthModalOpen]);

  const handleSignOut = async () => {
    try {
      if (isClerkSignedIn) {
        await clerkSignOut();
      }
    } catch (err) {
      console.warn('[CivicPulse] Sign-out warning:', err);
    }
    setMockUser(null);
    setIsDemoBypass(false);
    sessionStorage.removeItem('civicpulse_mock_user');
    sessionStorage.removeItem('civicpulse_demo_bypass');
  };

  const handleSignInMock = (profile?: Partial<AuthUserProfile>) => {
    const defaultName = profile?.fullName || 'Citizen Reporter';
    const newProfile: AuthUserProfile = {
      id: profile?.id || `civic_${Date.now()}`,
      fullName: defaultName,
      firstName: profile?.firstName || defaultName.split(' ')[0] || 'Citizen',
      email: profile?.email || 'citizen@civicpulse.blr',
      imageUrl: profile?.imageUrl || null,
      role: profile?.role || 'CITIZEN'
    };
    setMockUser(newProfile);
    setIsDemoBypass(false);
    sessionStorage.setItem('civicpulse_mock_user', JSON.stringify(newProfile));
    sessionStorage.removeItem('civicpulse_demo_bypass');
    setIsAuthModalOpen(false);
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
    : mockUser
    ? mockUser
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
    isSignedIn: Boolean(isClerkSignedIn || mockUser || isDemoBypass),
    isDemoBypass,
    isClerkAvailable: true,
    isRealClerkUser: Boolean(clerkUser),
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
      const judgeProfile: AuthUserProfile = {
        id: 'guest-judge-session',
        fullName: 'Guest Judge',
        firstName: 'Judge',
        email: 'judge@civicpulse.blr',
        imageUrl: null,
        role: 'CHIEF_COMMISSIONER'
      };
      setMockUser(judgeProfile);
      setIsDemoBypass(true);
      sessionStorage.setItem('civicpulse_demo_bypass', 'true');
      sessionStorage.setItem('civicpulse_mock_user', JSON.stringify(judgeProfile));
      setIsAuthModalOpen(false);
    },
    disableDemoBypass: () => {
      setIsDemoBypass(false);
      sessionStorage.removeItem('civicpulse_demo_bypass');
    },
    signInMock: handleSignInMock,
    clerkKey,
    setClerkKey,
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
  clerkKey: string;
  setClerkKey: (key: string) => void;
  error?: string | null;
}> = ({
  children,
  isAuthModalOpen,
  setIsAuthModalOpen,
  authModalTab,
  setAuthModalTab,
  isDemoBypass,
  setIsDemoBypass,
  clerkKey,
  setClerkKey,
  error = null
}) => {
  const [mockUser, setMockUser] = useState<AuthUserProfile | null>(() => {
    const saved = sessionStorage.getItem('civicpulse_mock_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    if (sessionStorage.getItem('civicpulse_demo_bypass') === 'true') {
      return {
        id: 'guest-judge-session',
        fullName: 'Guest Judge (Demo Mode)',
        firstName: 'Judge',
        email: 'judge@civicpulse.blr',
        imageUrl: null,
        role: 'CHIEF_COMMISSIONER'
      };
    }
    return null;
  });

  const handleSignInMock = (profile?: Partial<AuthUserProfile>) => {
    const defaultName = profile?.fullName || 'Citizen Reporter';
    const newProfile: AuthUserProfile = {
      id: profile?.id || `civic_${Date.now()}`,
      fullName: defaultName,
      firstName: profile?.firstName || defaultName.split(' ')[0] || 'Citizen',
      email: profile?.email || 'citizen@civicpulse.blr',
      imageUrl: profile?.imageUrl || null,
      role: profile?.role || 'CITIZEN'
    };
    setMockUser(newProfile);
    setIsDemoBypass(false);
    sessionStorage.setItem('civicpulse_mock_user', JSON.stringify(newProfile));
    sessionStorage.removeItem('civicpulse_demo_bypass');
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    setMockUser(null);
    setIsDemoBypass(false);
    sessionStorage.removeItem('civicpulse_mock_user');
    sessionStorage.removeItem('civicpulse_demo_bypass');
  };

  const user: AuthUserProfile | null = mockUser
    ? mockUser
    : isDemoBypass
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
    isSignedIn: Boolean(mockUser !== null || isDemoBypass),
    isDemoBypass,
    isClerkAvailable: false,
    isRealClerkUser: false,
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
      const judgeProfile: AuthUserProfile = {
        id: 'guest-judge-session',
        fullName: 'Guest Judge (Demo Mode)',
        firstName: 'Judge',
        email: 'judge@civicpulse.blr',
        imageUrl: null,
        role: 'CHIEF_COMMISSIONER'
      };
      setMockUser(judgeProfile);
      setIsDemoBypass(true);
      sessionStorage.setItem('civicpulse_demo_bypass', 'true');
      sessionStorage.setItem('civicpulse_mock_user', JSON.stringify(judgeProfile));
      setIsAuthModalOpen(false);
    },
    disableDemoBypass: () => {
      setIsDemoBypass(false);
      sessionStorage.removeItem('civicpulse_demo_bypass');
    },
    signInMock: handleSignInMock,
    clerkKey,
    setClerkKey,
    signOut: handleSignOut,
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

  const [clerkKey, setClerkKey] = useState<string>(() => {
    const saved = localStorage.getItem('civicpulse_clerk_publishable_key');
    if (saved && saved.trim()) return saved.trim();
    const envKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '') as string;
    return envKey.trim();
  });

  const handleSetClerkKey = (key: string) => {
    const cleanKey = key.trim();
    setClerkKey(cleanKey);
    if (cleanKey && !cleanKey.includes('your_clerk_publishable_key')) {
      localStorage.setItem('civicpulse_clerk_publishable_key', cleanKey);
    } else {
      localStorage.removeItem('civicpulse_clerk_publishable_key');
    }
  };

  const isKeyValid = Boolean(
    clerkKey &&
    !clerkKey.includes('your_clerk_publishable_key') &&
    (clerkKey.startsWith('pk_test_') || clerkKey.startsWith('pk_live_'))
  );

  // If no valid publishable key is present, run in resilient fallback mode
  if (!isKeyValid) {
    return (
      <FallbackAuthProvider
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        authModalTab={authModalTab}
        setAuthModalTab={setAuthModalTab}
        isDemoBypass={isDemoBypass}
        setIsDemoBypass={setIsDemoBypass}
        clerkKey={clerkKey}
        setClerkKey={handleSetClerkKey}
        error="Clerk publishable key not active. Interactive CivicPulse Command Auth active."
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
          clerkKey={clerkKey}
          setClerkKey={handleSetClerkKey}
          error={`Clerk initialization error: ${error.message}`}
        >
          {children}
        </FallbackAuthProvider>
      )}
    >
      <ClerkProvider publishableKey={clerkKey} appearance={clerkAppearance}>
        <ClerkAuthBridge
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          authModalTab={authModalTab}
          setAuthModalTab={setAuthModalTab}
          isDemoBypass={isDemoBypass}
          setIsDemoBypass={setIsDemoBypass}
          clerkKey={clerkKey}
          setClerkKey={handleSetClerkKey}
        >
          {children}
        </ClerkAuthBridge>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
};
