export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function getSeverityColor(severity: string): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]'
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]'
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        glow: 'shadow-[0_0_15px_rgba(0,240,255,0.2)]'
      };
  }
}

export function getStatusBadge(status: string): { label: string; color: string } {
  switch (status) {
    case 'REPORTED':
      return { label: 'Citizen Reported', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    case 'TRIAGED':
      return { label: 'AI Triaged', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    case 'TENDER_ASSIGNED':
      return { label: 'Crew Dispatched', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    case 'WORK_IN_PROGRESS':
      return { label: 'Patching in Progress', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    case 'REPAIRED':
      return { label: 'Repaired (Pending Audit)', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    case 'AI_VERIFIED':
      return { label: 'AI Verified Fixed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    default:
      return { label: status, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  }
}
