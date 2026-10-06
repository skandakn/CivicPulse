export const clerkAppearance = {
  variables: {
    colorPrimary: '#000000',
    colorBackground: '#f8f9e9',
    colorText: '#000000',
    colorTextSecondary: '#475569',
    colorInputBackground: '#ffffff',
    colorInputText: '#000000',
    colorNeutral: '#000000',
    borderRadius: '0px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-[#f8f9e9] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none w-full p-4',
    headerTitle: 'text-black font-black text-xl uppercase tracking-tight',
    headerSubtitle: 'text-slate-600 text-xs font-mono',
    socialButtonsBlockButton: 'border-[2px] border-black hover:bg-slate-200 bg-white text-black transition-all rounded-none py-2.5',
    socialButtonsBlockButtonText: 'text-black text-xs font-bold font-mono uppercase',
    dividerLine: 'bg-black/20',
    dividerText: 'text-slate-600 text-[10px] font-mono uppercase tracking-widest',
    formButtonPrimary: 'bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-3 border-[2px] border-black rounded-none transition-all cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)]',
    formFieldInput: 'bg-white border-[2px] border-black text-black text-xs rounded-none focus:ring-0 focus:outline-none focus:border-blue-600 transition-all font-mono shadow-[2px_2px_0_0_rgba(0,0,0,1)]',
    formFieldLabel: 'text-black text-[11px] font-bold font-mono uppercase tracking-wider',
    footerActionText: 'text-slate-600 text-xs font-mono',
    footerActionLink: 'text-blue-600 hover:text-blue-800 font-bold text-xs font-mono',
    identityPreviewText: 'text-black font-bold text-xs font-mono',
    identityPreviewEditButton: 'text-blue-600 hover:text-blue-800 text-xs font-mono font-bold',
    userButtonPopoverCard: 'bg-[#f8f9e9] border-[3px] border-black text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none font-mono',
    userButtonPopoverActionButton: 'hover:bg-slate-200 text-black transition-colors rounded-none',
    userButtonPopoverActionButtonText: 'text-black text-xs font-bold',
    userButtonPopoverFooter: 'hidden'
  }
};
