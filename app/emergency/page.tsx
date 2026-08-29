import React from 'react';
import { getTelUrl } from '@/lib/location';
import {
  PhoneCall,
  ShieldAlert,
  HeartPulse,
  Flame,
  Truck,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Phone,
} from 'lucide-react';

const EMERGENCY_CONTACTS = [
  {
    id: 'police',
    name: 'Police Emergency',
    number: '112',
    description: 'National emergency number for police, crime & safety assistance',
    icon: ShieldAlert,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'ambulance',
    name: 'Medical Ambulance & First Aid',
    number: '108',
    description: 'Emergency medical services and trauma ambulance response',
    icon: HeartPulse,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  {
    id: 'highway',
    name: 'National Highway Emergency',
    number: '1033',
    description: 'Highway accidents, towing, and NHAI emergency assistance',
    icon: Truck,
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    id: 'fire',
    name: 'Fire & Rescue Service',
    number: '101',
    description: 'Vehicle fire, electrical fire, and hazardous rescue operations',
    icon: Flame,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  {
    id: 'rsa',
    name: 'National 24/7 Roadside Hotline',
    number: '1800-209-5566',
    description: 'Toll-free national vehicle towing and rescue coordination',
    icon: PhoneCall,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    id: 'women',
    name: 'Women & Safety Helpline',
    number: '1091',
    description: 'Dedicated 24/7 emergency response for women travelers',
    icon: HelpCircle,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
];

const SAFETY_TIPS = [
  'Move your bike completely off the active roadway onto the shoulder or footpath.',
  'Turn on hazard warning lights or indicators immediately to warn approaching vehicles.',
  'Stand away from the vehicle and behind a highway crash barrier if available.',
  'Never attempt to perform complex repairs in the middle of a busy traffic lane or at night without reflective gear.',
  'Share your live GPS location with a family member or friend in addition to requesting mechanic assistance.',
];

export default function EmergencyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-red-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-sm">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Immediate Emergency Helplines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Emergency & SOS Assistance
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-red-100 leading-relaxed">
            In the event of a severe accident, fire, or immediate threat to physical
            safety, call the official government and highway emergency numbers below.
          </p>
        </div>
      </div>

      {/* Emergency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {EMERGENCY_CONTACTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${item.color} bg-white`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                    {item.number}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <a
                href={getTelUrl(item.number)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${item.buttonColor}`}
              >
                <Phone className="w-4 h-4" />
                <span>Call {item.number} Now</span>
              </a>
            </div>
          );
        })}
      </div>

      {/* Breakdown Safety Protocols */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-brand-600" />
          <span>Roadside Breakdown Safety Checklist</span>
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Follow these essential safety rules while waiting for roadside assistance
        </p>

        <div className="space-y-3">
          {SAFETY_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
