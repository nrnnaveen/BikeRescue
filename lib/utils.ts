import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BikeProblem, RequestStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function getProblemDetails(problem: BikeProblem) {
  const problems: Record<
    BikeProblem,
    { label: string; icon: string; description: string; color: string }
  > = {
    Puncture: {
      label: 'Tyre Puncture',
      icon: '⭕',
      description: 'Flat tire, tube replacement, or patch needed',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    Battery: {
      label: 'Dead Battery',
      icon: '🔋',
      description: 'Jump start, self-start issue, battery drained',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    Engine: {
      label: 'Engine Breakdown',
      icon: '⚙️',
      description: 'Overheating, strange noises, engine stalled',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    Brake: {
      label: 'Brake Failure',
      icon: '🛑',
      description: 'Brake loose, pad worn, hydraulic fluid leak',
      color: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    Tyre: {
      label: 'Tyre Replacement',
      icon: '🛞',
      description: 'Tyre burst, sidewall tear, worn tread',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
    },
    Chain: {
      label: 'Chain Snapped / Off',
      icon: '🔗',
      description: 'Chain slipped, broken link, sprocket lock',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    Electrical: {
      label: 'Electrical & Lights',
      icon: '⚡',
      description: 'Headlights dead, wiring fuse, horn failure',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    Fuel: {
      label: 'Out of Fuel',
      icon: '⛽',
      description: 'Empty tank, fuel line clog, carburetor issue',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    Accident: {
      label: 'Accident / Towing',
      icon: '🚨',
      description: 'Collision damage, vehicle immobilized, tow needed',
      color: 'bg-red-100 text-red-900 border-red-400',
    },
    Other: {
      label: 'Other Issue',
      icon: '🔧',
      description: 'General mechanical difficulty or inspection',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    },
  };

  return (
    problems[problem] || {
      label: problem,
      icon: '🔧',
      description: 'Mechanical assistance needed',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    }
  );
}

export function getStatusDetails(status: RequestStatus) {
  const map: Record<
    RequestStatus,
    {
      label: string;
      color: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
      step: number;
    }
  > = {
    SEARCHING: {
      label: 'Searching Mechanic',
      color: 'amber',
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      step: 1,
    },
    ACCEPTED: {
      label: 'Mechanic Accepted',
      color: 'blue',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      step: 2,
    },
    ON_THE_WAY: {
      label: 'Mechanic On The Way',
      color: 'indigo',
      bgColor: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-300',
      step: 3,
    },
    ARRIVED: {
      label: 'Mechanic Arrived',
      color: 'purple',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
      step: 4,
    },
    IN_PROGRESS: {
      label: 'Repair In Progress',
      color: 'orange',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
      step: 5,
    },
    COMPLETED: {
      label: 'Repair Completed',
      color: 'green',
      bgColor: 'bg-green-600',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      step: 6,
    },
    CANCELLED: {
      label: 'Request Cancelled',
      color: 'slate',
      bgColor: 'bg-slate-500',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-300',
      step: 0,
    },
  };

  return (
    map[status] || {
      label: status,
      color: 'slate',
      bgColor: 'bg-slate-500',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-300',
      step: 0,
    }
  );
}
