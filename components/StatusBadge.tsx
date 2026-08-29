import React from 'react';
import { RequestStatus } from '@/lib/types';
import { getStatusDetails } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  Navigation,
  MapPin,
  Wrench,
  CheckCheck,
  XCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: StatusBadgeProps) {
  const details = getStatusDetails(status);

  const getIcon = () => {
    switch (status) {
      case 'SEARCHING':
        return <Clock className="w-3.5 h-3.5 animate-spin" />;
      case 'ACCEPTED':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'ON_THE_WAY':
        return <Navigation className="w-3.5 h-3.5 animate-pulse" />;
      case 'ARRIVED':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'COMPLETED':
        return <CheckCheck className="w-3.5 h-3.5" />;
      case 'CANCELLED':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  const colorStyles: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    blue: 'bg-blue-50 text-blue-800 border-blue-300',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    purple: 'bg-purple-50 text-purple-800 border-purple-300',
    orange: 'bg-orange-50 text-orange-800 border-orange-300',
    green: 'bg-green-50 text-green-800 border-green-300',
    slate: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${sizeClasses} ${
        colorStyles[details.color] || colorStyles.slate
      }`}
    >
      {showIcon && getIcon()}
      <span>{details.label}</span>
    </span>
  );
}
