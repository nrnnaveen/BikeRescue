import React from 'react';
import { RequestStatus } from '@/lib/types';
import { Check, Clock, Navigation, MapPin, Wrench, CheckCheck, X } from 'lucide-react';

interface StatusTimelineProps {
  status: RequestStatus;
  createdAt?: string;
  updatedAt?: string;
  shopName?: string;
}

interface Step {
  id: RequestStatus;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

export default function StatusTimeline({
  status,
  shopName,
}: StatusTimelineProps) {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <X className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Request Cancelled</h4>
          <p className="text-xs text-red-600">This assistance request was cancelled.</p>
        </div>
      </div>
    );
  }

  const steps: Step[] = [
    {
      id: 'SEARCHING',
      title: 'Request Sent',
      subtitle: 'Searching for nearby available mechanics',
      icon: Clock,
    },
    {
      id: 'ACCEPTED',
      title: 'Mechanic Accepted',
      subtitle: shopName ? `${shopName} accepted the request` : 'Assigned to mechanic',
      icon: Check,
    },
    {
      id: 'ON_THE_WAY',
      title: 'Mechanic On The Way',
      subtitle: 'Technician is travelling to your location',
      icon: Navigation,
    },
    {
      id: 'ARRIVED',
      title: 'Mechanic Arrived',
      subtitle: 'Technician reached the incident location',
      icon: MapPin,
    },
    {
      id: 'IN_PROGRESS',
      title: 'Repair In Progress',
      subtitle: 'Bike diagnosis and repair underway',
      icon: Wrench,
    },
    {
      id: 'COMPLETED',
      title: 'Completed',
      subtitle: 'Repair finished & ready to ride',
      icon: CheckCheck,
    },
  ];

  const statusOrder: RequestStatus[] = [
    'SEARCHING',
    'ACCEPTED',
    'ON_THE_WAY',
    'ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
  ];

  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="py-2">
      <div className="relative">
        {/* Continuous background track */}
        <div className="absolute top-4 left-4 bottom-4 w-0.5 bg-slate-200 -z-0" />

        <div className="space-y-6 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={step.id} className="flex items-start gap-4 group">
                {/* Step Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-200 flex-shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-brand-500 text-white shadow-md ring-4 ring-brand-100 animate-pulse'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Text */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-brand-600'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[11px] font-medium bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full animate-pulse">
                        Current
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isCurrent || isCompleted ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
