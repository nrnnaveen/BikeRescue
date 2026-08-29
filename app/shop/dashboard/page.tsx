'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HelpRequest, Shop, UserSafe } from '@/lib/types';
import RequestCard from '@/components/RequestCard';
import {
  Wrench,
  Power,
  Clock,
  CheckCircle2,
  ListOrdered,
  MapPin,
  Phone,
  ArrowRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Star,
} from 'lucide-react';
import Link from 'next/link';

export default function ShopDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSafe | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [assignedRequests, setAssignedRequests] = useState<HelpRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingAvailability, setTogglingAvailability] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchShopData = async () => {
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
      if (authData.user.role !== 'SHOP') {
        router.push('/user/dashboard');
        return;
      }

      setUser(authData.user);
      setShop(authData.shop || null);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setAssignedRequests(reqData.assigned || []);
        setIncomingRequests(reqData.incoming || []);
        if (reqData.shop) {
          setShop(reqData.shop);
        }
      }
    } catch (e) {
      console.error('Failed to load shop dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
    const interval = setInterval(fetchShopData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAvailability = async () => {
    if (!shop) return;
    setTogglingAvailability(true);
    try {
      const nextState = !shop.is_available;
      const res = await fetch('/api/shops/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: nextState }),
      });
      if (res.ok) {
        setShop({ ...shop, is_available: nextState });
      }
    } catch (e) {
      console.error('Failed to toggle availability:', e);
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    setActionLoadingId(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to accept request');
        return;
      }
      // Redirect to action center
      router.push(`/shop/requests/${requestId}`);
    } catch (e) {
      console.error('Accept request error:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = (requestId: number) => {
    // Hide from local incoming view
    setIncomingRequests(incomingRequests.filter((r) => r.id !== requestId));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const activeJobs = assignedRequests.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  );
  const completedJobs = assignedRequests.filter((r) => r.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Shop Banner & Availability Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              Mechanical Partner Portal
            </span>
            {shop && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{shop.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({shop.rating_count})</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {shop?.shop_name || 'My Workshop'} 🔧
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{shop?.address}</span>
          </p>
        </div>

        {/* Live Availability Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchShopData()}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors border border-slate-200"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleAvailability}
            disabled={togglingAvailability}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all ${
              shop?.is_available
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-slate-800 hover:bg-slate-900 text-slate-200'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{shop?.is_available ? 'ONLINE & ACCEPTING' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* Offline Alert Warning if Shop is turned off */}
      {shop && !shop.is_available && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              Your workshop is currently <b>Offline</b>. You will not receive new breakdown alerts until you toggle to <b>Online & Accepting</b>.
            </span>
          </div>
          <button
            onClick={handleToggleAvailability}
            className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors flex-shrink-0"
          >
            Go Online
          </button>
        </div>
      )}

      {/* Statistics 3-Tile Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Incoming Nearby</span>
            <h3 className="text-3xl font-black text-brand-600 mt-1">
              {incomingRequests.length}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Searching for mechanics</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Active Jobs</span>
            <h3 className="text-3xl font-black text-purple-600 mt-1">
              {activeJobs.length}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">In dispatch / repair</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Completed Repairs</span>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">
              {completedJobs.length}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Successfully solved</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section 1: Incoming Nearby Requests Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
            <span>Nearby Breakdown Requests ({incomingRequests.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Live 25km radius dispatch</span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No new incoming requests right now</h4>
            <p className="text-xs text-slate-500 mt-1">
              When a bike rider breaks down nearby, their request will instantly appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {incomingRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                userRole="SHOP"
                onAccept={handleAcceptRequest}
                onReject={handleDeclineRequest}
                isAccepting={actionLoadingId === req.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Assigned Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-purple-600" />
            <span>Active Ongoing Jobs ({activeJobs.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeJobs.map((req) => (
              <RequestCard key={req.id} request={req} userRole="SHOP" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
