import { dark } from '@clerk/themes';

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#00F0FF',
    colorBackground: '#090C16',
    colorText: '#F8FAFC',
    colorTextSecondary: '#94A3B8',
    colorInputBackground: '#0D111E',
    colorInputText: '#FFFFFF',
    colorNeutral: '#1E293B',
    borderRadius: '0.75rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-[#090C16]/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.85)] backdrop-blur-xl rounded-2xl w-full',
    headerTitle: 'text-white font-black text-xl tracking-tight',
    headerSubtitle: 'text-slate-400 text-xs font-sans',
    socialButtonsBlockButton: 'border border-white/10 hover:border-cyan-500/40 bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-xl py-2.5',
    socialButtonsBlockButtonText: 'text-slate-200 text-xs font-medium',
    dividerLine: 'bg-white/10',
    dividerText: 'text-slate-500 text-[10px] font-mono uppercase tracking-widest',
    formButtonPrimary: 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer',
    formFieldInput: 'bg-[#0D111E] border border-white/10 text-white text-xs rounded-xl focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all',
    formFieldLabel: 'text-slate-300 text-[11px] font-mono uppercase tracking-wider',
    footerActionText: 'text-slate-400 text-xs',
    footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-bold text-xs',
    identityPreviewText: 'text-slate-200 font-medium text-xs',
    identityPreviewEditButton: 'text-cyan-400 hover:text-cyan-300 text-xs font-mono',
    userButtonPopoverCard: 'bg-[#0E121B] border border-white/10 text-slate-200 shadow-2xl rounded-2xl',
    userButtonPopoverActionButton: 'hover:bg-white/5 text-slate-300 hover:text-white transition-colors',
    userButtonPopoverActionButtonText: 'text-slate-300 text-xs',
    userButtonPopoverFooter: 'hidden'
  }
};
