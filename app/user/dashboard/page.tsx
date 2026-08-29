'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserSafe, HelpRequest } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { getProblemDetails, formatDate } from '@/lib/utils';
import { formatDistance } from '@/lib/distance';
import { getTelUrl, getNavigationUrl } from '@/lib/location';
import {
  AlertTriangle,
  Compass,
  Bike,
  ListOrdered,
  PhoneCall,
  User,
  MapPin,
  Phone,
  Navigation,
  ArrowRight,
  Loader2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserSafe | null>(null);
  const [activeRequest, setActiveRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      const [authRes, reqRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/requests'),
      ]);

      if (!authRes.ok) {
        router.push('/login');
        return;
      }

      const authData = await authRes.json();
      if (!authData.user) {
        router.push('/login');
        return;
      }
      if (authData.user.role === 'SHOP') {
        router.push('/shop/dashboard');
        return;
      }

      setUser(authData.user);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setActiveRequest(reqData.active || null);
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const problemMeta = activeRequest ? getProblemDetails(activeRequest.problem) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Greeting Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Rider Assistance Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Hello, {user?.name || 'Rider'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Need on-demand road assistance? Tap below to dispatch a nearby mechanic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/emergency"
            className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2.5 rounded-2xl border border-red-200 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-red-600" />
            <span>Emergency SOS</span>
          </Link>
        </div>
      </div>

      {/* Active Request Live Banner (if any ongoing breakdown) */}
      {activeRequest && problemMeta && (
        <div className="bg-gradient-to-tr from-orange-50 via-white to-amber-50 rounded-3xl p-6 border-2 border-brand-300 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-orange-200/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-orange-200 flex items-center justify-center text-2xl shadow-sm">
                {problemMeta.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
                  <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                    Active Roadside Request
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-0.5">
                  {problemMeta.label} ({activeRequest.bike_brand} {activeRequest.bike_model})
                </h3>
              </div>
            </div>

            <StatusBadge status={activeRequest.status} size="lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
            <div className="bg-white/80 p-3 rounded-2xl border border-orange-100">
              <span className="text-slate-400 font-medium">Breakdown Problem:</span>
              <p className="font-bold text-slate-800 mt-0.5">{problemMeta.label}</p>
              {activeRequest.description && (
                <p className="text-slate-500 italic text-[11px] mt-1 line-clamp-1">
                  &quot;{activeRequest.description}&quot;
                </p>
              )}
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-orange-100">
              <span className="text-slate-400 font-medium">Assigned Workshop:</span>
              {activeRequest.shop_name ? (
                <div>
                  <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <span>{activeRequest.shop_name}</span>
                    {activeRequest.shop_rating && (
                      <span className="text-amber-600 text-[11px]">⭐ {activeRequest.shop_rating}</span>
                    )}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Technician: {activeRequest.shop_owner || 'Mechanic'}
                  </p>
                </div>
              ) : (
                <p className="font-semibold text-amber-600 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching nearby mechanics...</span>
                </p>
              )}
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-orange-100">
              <span className="text-slate-400 font-medium">Incident Location & Distance:</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {activeRequest.distance !== undefined
                  ? formatDistance(activeRequest.distance)
                  : 'Location pinned'}
              </p>
              <p className="text-slate-500 text-[11px]">
                Reported {formatDate(activeRequest.created_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              href={`/user/requests/${activeRequest.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-colors"
            >
              <span>View Live Map & Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {activeRequest.shop_phone && (
              <a
                href={getTelUrl(activeRequest.shop_phone)}
                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Mechanic</span>
              </a>
            )}

            {activeRequest.latitude && activeRequest.longitude && (
              <a
                href={getNavigationUrl(activeRequest.latitude, activeRequest.longitude)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition-colors"
              >
                <Navigation className="w-4 h-4 text-brand-600" />
                <span>Open Navigation</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Big CTA Button */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Instant Dispatch</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black mt-3 leading-tight">
            🚨 REQUEST MECHANICAL HELP
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 mt-2">
            Stuck on the road? Pin your GPS location and broadcast your breakdown to
            verified mechanical workshops within minutes.
          </p>

          <div className="mt-6">
            <Link
              href="/user/request"
              className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-orange-50 font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              <AlertTriangle className="w-5 h-5 text-brand-600 stroke-[2.5]" />
              <span>START HELP REQUEST NOW</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative background icon */}
        <Bike className="absolute -right-8 -bottom-10 w-64 h-64 text-white/10 rotate-12 pointer-events-none" />
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link
          href="/user/shops"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">Nearby Shops</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Explore local mechanics</p>
        </Link>

        <Link
          href="/user/bikes"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <Bike className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">My Bikes</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Manage your garage</p>
        </Link>

        <Link
          href="/user/requests"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <ListOrdered className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">My Requests</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">View repair history</p>
        </Link>

        <Link
          href="/emergency"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">Emergency</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Police, Ambulance, RSA</p>
        </Link>

        <Link
          href="/user/profile"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col items-center text-center group col-span-2 sm:col-span-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">My Profile</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Account & contact info</p>
        </Link>
      </div>
    </div>
  );
}
