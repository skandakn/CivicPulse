import React from 'react';
import { Lock, KeyRound, Zap, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuthSession } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface ProtectedViewProps {
  title: string;
  children: React.ReactNode;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({ title, children }) => {
  const { isLoaded, isSignedIn, isDemoBypass, openSignIn, enableDemoBypass } = useAuthSession();
  const { setCurrentView } = useApp();

  // Loading state prevents flashing protected content
  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>
        <div className="text-center font-mono">
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
            AUTHENTICATING CIVICPULSE SESSION
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Verifying cryptographic token credentials...
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated or has active demo bypass, render the protected view
  if (isSignedIn || isDemoBypass) {
    return <>{children}</>;
  }

  // Unauthenticated fallback: Command Access Gateway
  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-2xl bg-[#090C16]/95 border border-cyan-500/30 p-8 shadow-[0_0_50px_rgba(0,240,255,0.14)] text-center space-y-6 relative overflow-hidden">
        {/* Top Accent Lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-extrabold px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 inline-block">
            RESTRICTED ACCESS // COMMAND CORE
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
            Access to <strong className="text-cyan-300">{title}</strong> requires an authenticated session. Sign in with Clerk or enter instantly with Judge Demo Access.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Sign In Primary Action */}
          <button
            onClick={openSignIn}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <KeyRound className="w-4 h-4 text-slate-950" />
            <span>Sign In with Clerk</span>
          </button>

          {/* Judge Demo Bypass Action */}
          <button
            onClick={enableDemoBypass}
            className="w-full py-3 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>⚡ Enter via Guest Judge Demo (No Account Required)</span>
          </button>

          {/* Return to Public Overview */}
          <button
            onClick={() => setCurrentView('LANDING')}
            className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors pt-2 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
