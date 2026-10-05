import React from 'react';
import { X, ShieldCheck, Zap, Lock, LogIn, UserPlus } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useAuthSession } from '../../context/AuthContext';
import { clerkAppearance } from './clerkAppearance';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openSignIn,
    openSignUp,
    enableDemoBypass,
    isClerkAvailable
  } = useAuthSession();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#090C16] border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.18)] p-6 overflow-hidden max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Modal Top Bar */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  CivicPulse Command Access
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  CLERK AUTH
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
        <div className="relative flex items-center gap-2 pt-4 pb-3">
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

        {/* Scrollable Clerk Component Container */}
        <div className="relative flex-1 overflow-y-auto pr-1 py-1 space-y-4">
          {isClerkAvailable ? (
            <div className="clerk-container flex justify-center w-full">
              {authModalTab === 'sign-in' ? (
                <SignIn routing="virtual" appearance={clerkAppearance} />
              ) : (
                <SignUp routing="virtual" appearance={clerkAppearance} />
              )}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-500/10 border border-slate-500/30 flex items-center justify-center mx-auto text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Clerk Offline / Guest Access</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Clerk publishable key is not active or internet connection is offline. You can continue as a guest to explore all features.
                </p>
              </div>
            </div>
          )}

          {/* Guest / Presentation Access Card */}
          <div className="p-4 rounded-xl bg-[#0C101D] border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.06)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  Guest Access
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                NO ACCOUNT NEEDED
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Explore CivicPulse without creating an account — God's Eye geospatial intelligence, Pothole Vision, and contractor accountability records.
            </p>

            <button
              onClick={enableDemoBypass}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>⚡ Continue as Guest (Explore All Features)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
