import React, { useState } from 'react';
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
  User,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert
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
  color: string;
  initials: string;
  borderColor: string;
  badgeBg: string;
}[] = [
  {
    role: 'CITIZEN',
    name: 'Aarav Sharma',
    designation: 'Citizen Reporter • Bellandur Resident',
    email: 'aarav.sharma@civicpulse.blr',
    badge: 'CITIZEN',
    color: 'from-cyan-500 to-blue-600',
    initials: 'AS',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
  },
  {
    role: 'WARD_ENGINEER',
    name: 'Er. Priya Nair',
    designation: 'BBMP Ward 142 • Assistant Executive Engineer',
    email: 'priya.nair@bbmp.gov.in',
    badge: 'WARD ENG',
    color: 'from-amber-500 to-orange-600',
    initials: 'PN',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  {
    role: 'CHIEF_COMMISSIONER',
    name: 'Dr. Rajesh Gowda, IAS',
    designation: 'Chief Commissioner • BBMP Central Headquarters',
    email: 'commissioner@bbmp.gov.in',
    badge: 'COMMISSIONER',
    color: 'from-rose-500 to-red-600',
    initials: 'RG',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  },
  {
    role: 'AUDITOR',
    name: 'Kavitha Reddy',
    designation: 'Quality Control Auditor • Karnataka PWD Vigilance',
    email: 'kavitha.reddy@pwd.karnataka.gov.in',
    badge: 'AUDITOR',
    color: 'from-purple-500 to-indigo-600',
    initials: 'KR',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
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

  if (!isAuthModalOpen) return null;

  const handleSelectProfile = (profile: typeof DEMO_PROFILES[0]) => {
    signInMock({
      id: `usr_${profile.role.toLowerCase()}_${Date.now()}`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#090C16] border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.18)] p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Modal Top Bar */}
        <div className="relative flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  CivicPulse Command Access
                </h3>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    isClerkAvailable
                      ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30'
                      : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {isClerkAvailable ? 'CLERK ACTIVE' : 'CIVIC AUTH'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                AI-Powered Pothole Intelligence &amp; Accountability
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="relative flex items-center gap-2 pt-3 pb-2.5 shrink-0">
          <button
            onClick={openSignIn}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authModalTab === 'sign-in'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={openSignUp}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authModalTab === 'sign-up'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="relative flex-1 overflow-y-auto pr-1 py-1 space-y-4">
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
                  className="text-xs text-slate-400 hover:text-cyan-300 underline font-mono transition-colors cursor-pointer"
                >
                  ⚡ Or switch to 1-Click Multi-Role Fast Track
                </button>
              </div>
            </div>
          ) : (
            /* Interactive CivicPulse Authentication & Quick Role Access */
            <div className="space-y-4">
              {/* Sign-In Tab: 1-Click Role Profiles */}
              {authModalTab === 'sign-in' ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        1-Click Instant Sign In by Role
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Select to authenticate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEMO_PROFILES.map((profile) => (
                        <button
                          key={profile.role}
                          onClick={() => handleSelectProfile(profile)}
                          className={`p-2.5 rounded-xl bg-white/[0.02] border transition-all text-left group cursor-pointer hover:bg-white/[0.05] ${profile.borderColor}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${profile.color} flex items-center justify-center text-slate-950 font-bold text-xs font-mono shrink-0 shadow-sm`}
                            >
                              {profile.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                                  {profile.name}
                                </span>
                                <span
                                  className={`text-[8px] font-mono px-1 rounded border shrink-0 ${profile.badgeBg}`}
                                >
                                  {profile.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {profile.designation}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Or Sign In With Custom Email & Password */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Or Sign In With Custom Credentials
                    </div>

                    <form onSubmit={handleDirectSignIn} className="space-y-2">
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="resident@civicpulse.blr"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-[#070A14] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password (any password accepted)"
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#070A14] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all cursor-pointer shrink-0"
                        >
                          <span>Sign In</span>
                          <ArrowRight className="w-3 h-3 text-slate-950" />
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                /* Sign-Up Tab: Create Account */
                <form
                  onSubmit={handleDirectSignUp}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"
                >
                  <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                    Create Citizen / Official Account
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Balaji"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#070A14] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramesh@example.com"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#070A14] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                        Select Role Perspective
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['CITIZEN', 'WARD_ENGINEER', 'CHIEF_COMMISSIONER', 'AUDITOR'] as UserRole[]).map(
                          (role) => (
                            <button
                              type="button"
                              key={role}
                              onClick={() => setSelectedRole(role)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold border transition-all text-center cursor-pointer ${
                                selectedRole === role
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                  : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'
                              }`}
                            >
                              {role.replace('_', ' ')}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#070A14] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                    <span>Create Account &amp; Sign In</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Hackathon Judge / Presentation Bypass Card */}
          <div className="p-3.5 rounded-xl bg-[#0C101D] border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Hackathon Judge Bypass
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                ZERO FRICTION
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Evaluating CivicPulse for live hackathon judging? Skip authentication to inspect God’s Eye geospatial intelligence, Pothole Vision, and contractor liability records instantly.
            </p>

            <button
              onClick={enableDemoBypass}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>⚡ Enter as Guest Judge (Explore All Features)</span>
            </button>
          </div>

          {/* Collapsible: Connect Live Clerk Key */}
          <div className="rounded-xl border border-white/10 bg-white/[0.01] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsKeyDrawerOpen(!isKeyDrawerOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-[11px]">
                  {isClerkAvailable
                    ? 'Clerk Live Connected (Click to Reconfigure)'
                    : 'Connect Live Clerk Account (Optional)'}
                </span>
              </div>
              {isKeyDrawerOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isKeyDrawerOpen && (
              <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-white/5 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your Clerk Publishable Key (from{' '}
                  <a
                    href="https://dashboard.clerk.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    dashboard.clerk.com
                  </a>
                  ) to activate live OAuth, SMS OTP, and Clerk user management:
                </p>

                <form onSubmit={handleSaveClerkKey} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="pk_test_..."
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#070A14] border border-white/15 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    >
                      {keySaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <span>Save Key</span>
                      )}
                    </button>
                  </div>

                  {keyError && (
                    <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-mono">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>{keyError}</span>
                    </div>
                  )}

                  {isClerkAvailable && (
                    <button
                      type="button"
                      onClick={() => setShowDemoRoleSelector(false)}
                      className="text-[11px] text-cyan-400 hover:underline font-mono"
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
