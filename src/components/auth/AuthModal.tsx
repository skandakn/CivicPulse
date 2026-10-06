import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus,
  KeyRound,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useAuthSession } from '../../context/AuthContext';
import { useApp, UserRole } from '../../context/AppContext';
import { clerkAppearance } from './clerkAppearance';

const DEMO_PROFILES: {
  role: UserRole;
  name: string;
  designation: string;
  email: string;
  badge: string;
  initials: string;
}[] = [
  {
    role: 'CITIZEN',
    name: 'Aarav Sharma',
    designation: 'Citizen Reporter · Bellandur Resident',
    email: 'aarav.sharma@civicpulse.blr',
    badge: 'CITIZEN',
    initials: 'AS'
  },
  {
    role: 'WARD_ENGINEER',
    name: 'Er. Priya Nair',
    designation: 'BBMP Ward 142 · Asst. Executive Engineer',
    email: 'priya.nair@bbmp.gov.in',
    badge: 'WARD ENG',
    initials: 'PN'
  },
  {
    role: 'CHIEF_COMMISSIONER',
    name: 'Dr. Rajesh Gowda, IAS',
    designation: 'Chief Commissioner · BBMP HQ',
    email: 'commissioner@bbmp.gov.in',
    badge: 'COMMISSIONER',
    initials: 'RG'
  },
  {
    role: 'AUDITOR',
    name: 'Kavitha Reddy',
    designation: 'QC Auditor · Karnataka PWD Vigilance',
    email: 'kavitha.reddy@pwd.karnataka.gov.in',
    badge: 'AUDITOR',
    initials: 'KR'
  }
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openSignIn,
    openSignUp,
    enableDemoBypass,
    isClerkAvailable,
    signInMock,
    clerkKey,
    setClerkKey
  } = useAuthSession();

  const { setUserRole, addToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');

  const [keyInput, setKeyInput] = useState(() => clerkKey || '');
  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySaved, setKeySaved] = useState(false);
  const [showDemoRoleSelector, setShowDemoRoleSelector] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setShowDemoRoleSelector(false);
      setKeyInput(clerkKey || '');
    }
  }, [isAuthModalOpen, clerkKey]);

  const handleSelectProfile = (profile: typeof DEMO_PROFILES[0]) => {
    signInMock({
      id: `usr_${profile.role.toLowerCase()}_demo`,
      fullName: profile.name,
      firstName: profile.name.split(' ')[0],
      email: profile.email,
      role: profile.role
    });
    setUserRole(profile.role);
    addToast(
      `Signed In as ${profile.name}`,
      `Authenticated with ${profile.badge} privileges`,
      'success'
    );
  };

  const handleDirectSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const emailVal = email.trim() || 'citizen@civicpulse.blr';
    const nameVal =
      emailVal
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Citizen Reporter';

    signInMock({
      id: `usr_custom_${Date.now()}`,
      fullName: nameVal,
      firstName: nameVal.split(' ')[0],
      email: emailVal,
      role: selectedRole
    });
    setUserRole(selectedRole);
    addToast(`Signed In as ${nameVal}`, `Session activated (${selectedRole})`, 'success');
  };

  const handleDirectSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const nameVal = fullName.trim() || 'New Civic Reporter';
    const emailVal = email.trim() || 'reporter@civicpulse.blr';

    signInMock({
      id: `usr_new_${Date.now()}`,
      fullName: nameVal,
      firstName: nameVal.split(' ')[0],
      email: emailVal,
      role: selectedRole
    });
    setUserRole(selectedRole);
    addToast(`Account Created for ${nameVal}`, `Welcome to CivicPulse Bengaluru!`, 'success');
  };

  const handleSaveClerkKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setClerkKey('');
      setKeyError(null);
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2500);
      return;
    }
    if (!trimmed.startsWith('pk_test_') && !trimmed.startsWith('pk_live_')) {
      setKeyError('Key must begin with pk_test_ or pk_live_');
      return;
    }
    setKeyError(null);
    setClerkKey(trimmed);
    setKeySaved(true);
    addToast('Clerk Key Configured', 'Connecting to Clerk Authentication...', 'info');
    setTimeout(() => setKeySaved(false), 2500);
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#121210]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white brut shadow-[8px_8px_0_#121210] p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#121210] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#121210]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-black text-[#121210] tracking-tight">
                  CivicPulse Command Access
                </h3>
                <span className="tag bg-[#CFE8D6] text-[#121210] font-mono text-[10px] font-bold">
                  {isClerkAvailable ? 'CLERK ACTIVE' : 'CIVIC AUTH'}
                </span>
              </div>
              <p className="text-[11px] text-[#4A4A46] font-mono">
                AI-Powered Pothole Intelligence &amp; Accountability
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 border-2 border-[#121210] hover:bg-[#CFE8D6] transition-colors cursor-pointer"
            title="Close authentication modal"
          >
            <X className="w-4 h-4 text-[#121210]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 pb-2.5 shrink-0">
          <button
            onClick={openSignIn}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono font-bold transition-all cursor-pointer ${
              authModalTab === 'sign-in'
                ? 'bg-[#121210] text-[#CFE8D6] brut-sm'
                : 'bg-white text-[#121210] border-2 border-[#121210] hover:bg-[#CFE8D6]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={openSignUp}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono font-bold transition-all cursor-pointer ${
              authModalTab === 'sign-up'
                ? 'bg-[#121210] text-[#CFE8D6] brut-sm'
                : 'bg-white text-[#121210] border-2 border-[#121210] hover:bg-[#CFE8D6]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-4">
          {/* Active Clerk Mode (if configured and not bypassed for demo profiles) */}
          {isClerkAvailable && !showDemoRoleSelector ? (
            <div className="space-y-4">
              <div className="clerk-container flex justify-center w-full">
                {authModalTab === 'sign-in' ? (
                  <SignIn routing="virtual" appearance={clerkAppearance} />
                ) : (
                  <SignUp routing="virtual" appearance={clerkAppearance} />
                )}
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={() => setShowDemoRoleSelector(true)}
                  className="text-xs text-[#121210] hover:underline font-mono font-bold cursor-pointer"
                >
                  ⚡ Or switch to 1-Click Multi-Role Fast Track
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sign-In Tab: 1-Click Role Profiles */}
              {authModalTab === 'sign-in' ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#121210] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#2E8C42]" />
                        1-Click Instant Sign In by Role
                      </span>
                      <span className="text-[10px] font-mono text-[#4A4A46]">
                        Select to authenticate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEMO_PROFILES.map((profile) => (
                        <button
                          key={profile.role}
                          onClick={() => handleSelectProfile(profile)}
                          className="p-2.5 bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] shadow-[2px_2px_0_#121210] transition-all text-left group cursor-pointer btn-press"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#CFE8D6] border-2 border-[#121210] flex items-center justify-center text-[#121210] font-bold text-xs font-mono shrink-0">
                              {profile.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-display text-xs font-bold text-[#121210] truncate">
                                  {profile.name}
                                </span>
                                <span className="tag bg-[#121210] text-[#CFE8D6] text-[8px] font-mono shrink-0">
                                  {profile.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#4A4A46] truncate mt-0.5 font-mono">
                                {profile.designation}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Or Sign In With Custom Email & Password */}
                  <div className="p-3.5 bg-[#CFE8D6]/30 border-2 border-[#121210] space-y-2.5">
                    <div className="text-[11px] font-mono font-bold text-[#121210] uppercase tracking-wider">
                      Or Sign In With Custom Credentials
                    </div>

                    <form onSubmit={handleDirectSignIn} className="space-y-2">
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="resident@civicpulse.blr"
                          className="w-full px-3 py-2 text-xs bg-white border-2 border-[#121210] text-[#121210] placeholder-[#4A4A46] focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password (any accepted)"
                          className="flex-1 px-3 py-2 text-xs bg-white border-2 border-[#121210] text-[#121210] placeholder-[#4A4A46] focus:outline-none font-mono"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border-2 border-[#121210] btn-press"
                        >
                          <span>Sign In</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                /* Sign-Up Tab: Create Account */
                <form
                  onSubmit={handleDirectSignUp}
                  className="p-3.5 bg-[#CFE8D6]/30 border-2 border-[#121210] space-y-3"
                >
                  <div className="text-[11px] font-mono text-[#121210] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-[#2E8C42]" />
                    Create Citizen / Official Account
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#121210] uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Balaji"
                        className="w-full px-3 py-2 text-xs bg-white border-2 border-[#121210] text-[#121210] placeholder-[#4A4A46] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#121210] uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramesh@example.com"
                        className="w-full px-3 py-2 text-xs bg-white border-2 border-[#121210] text-[#121210] placeholder-[#4A4A46] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#121210] uppercase tracking-wider block mb-1">
                        Select Role Perspective
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['CITIZEN', 'WARD_ENGINEER', 'CHIEF_COMMISSIONER', 'AUDITOR'] as UserRole[]).map(
                          (role) => (
                            <button
                              type="button"
                              key={role}
                              onClick={() => setSelectedRole(role)}
                              className={`py-1.5 px-2 text-[10px] font-mono font-bold border-2 border-[#121210] transition-all text-center cursor-pointer ${
                                selectedRole === role
                                  ? 'bg-[#121210] text-[#CFE8D6]'
                                  : 'bg-white text-[#121210] hover:bg-[#CFE8D6]'
                              }`}
                            >
                              {role.replace('_', ' ')}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#121210] uppercase tracking-wider block mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full px-3 py-2 text-xs bg-white border-2 border-[#121210] text-[#121210] placeholder-[#4A4A46] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-[#121210] btn-press transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account &amp; Sign In</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Hackathon Judge / Presentation Bypass Card */}
          <div className="p-3.5 bg-[#E8A030]/20 border-2 border-[#121210] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#121210]" />
                <span className="text-xs font-mono font-black text-[#121210] uppercase tracking-wider">
                  Hackathon Judge Bypass
                </span>
              </div>
              <span className="tag bg-[#E8A030] text-[#121210] font-mono text-[9px] font-bold">
                ZERO FRICTION
              </span>
            </div>

            <p className="text-[11px] text-[#121210] leading-relaxed font-body">
              Evaluating CivicPulse for live hackathon judging? Skip authentication to inspect God’s Eye geospatial intelligence, Pothole Vision, and contractor liability records instantly.
            </p>

            <button
              onClick={enableDemoBypass}
              className="w-full py-2.5 px-4 bg-[#121210] text-[#E8A030] hover:bg-[#2E8C42] hover:text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#121210] btn-press transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Enter as Guest Judge (Explore All Features)</span>
            </button>
          </div>

          {/* Collapsible: Connect Live Clerk Key */}
          <div className="border-2 border-[#121210] bg-white overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsKeyDrawerOpen(!isKeyDrawerOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-[#121210] hover:bg-[#CFE8D6] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#121210]" />
                <span className="font-mono text-[11px]">
                  {isClerkAvailable
                    ? 'Clerk Live Connected (Click to Reconfigure)'
                    : 'Connect Live Clerk Account (Optional)'}
                </span>
              </div>
              {isKeyDrawerOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#121210]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#121210]" />
              )}
            </button>

            {isKeyDrawerOpen && (
              <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t-2 border-[#121210] bg-[#CFE8D6]/20">
                <p className="text-[11px] text-[#4A4A46] leading-relaxed font-mono">
                  Enter your Clerk Publishable Key (from dashboard.clerk.com) to activate live OAuth, SMS OTP, and Clerk user management:
                </p>

                <form onSubmit={handleSaveClerkKey} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="pk_test_..."
                      className="flex-1 px-3 py-2 text-xs bg-white border-2 border-[#121210] text-[#121210] placeholder-[#4A4A46] focus:outline-none font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-[#121210] text-[#CFE8D6] hover:bg-[#2E8C42] hover:text-white border-2 border-[#121210] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    >
                      {keySaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2E8C42]" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <span>Save Key</span>
                      )}
                    </button>
                  </div>

                  {keyError && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#C03A3A] font-mono font-bold">
                      <AlertCircle className="w-3 h-3 text-[#C03A3A]" />
                      <span>{keyError}</span>
                    </div>
                  )}

                  {isClerkAvailable && (
                    <button
                      type="button"
                      onClick={() => setShowDemoRoleSelector(false)}
                      className="text-[11px] text-[#121210] hover:underline font-mono font-bold"
                    >
                      Return to live Clerk widget
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
