'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HelpRequest, RequestStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import StatusTimeline from '@/components/StatusTimeline';
import Map from '@/components/Map';
import { getProblemDetails, formatDate } from '@/lib/utils';
import { formatDistance } from '@/lib/distance';
import { getTelUrl, getNavigationUrl } from '@/lib/location';
import {
  Bike,
  Phone,
  Navigation,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowLeft,
  Loader2,
  Wrench,
  Check,
  Star,
  User,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function ShopRequestActionPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchRequestDetails = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      if (!res.ok) {
        if (res.status === 401) router.push('/login');
        return;
      }
      const data = await res.json();
      setRequest(data.request || null);
    } catch (e) {
      console.error('Failed to fetch request details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
    const interval = setInterval(fetchRequestDetails, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const handleUpdateStatus = async (newStatus: RequestStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update request status');
        return;
      }
      setRequest(data.request);
    } catch (e) {
      console.error('Status update error:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleAccept = async () => {
    setUpdating(true);
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
      setRequest(data.request);
    } catch (e) {
      console.error('Accept error:', e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Job Ticket Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested assistance job ticket could not be found.
        </p>
        <Link
          href="/shop/dashboard"
          className="inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const problemMeta = getProblemDetails(request.problem);

  // Next status action configuration
  const getNextStatusAction = () => {
    switch (request.status) {
      case 'SEARCHING':
        return {
          label: 'Accept & Dispatch Mechanic',
          nextStatus: 'ACCEPTED' as RequestStatus,
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          action: handleAccept,
        };
      case 'ACCEPTED':
        return {
          label: '🚀 Start Driving (Mechanic On The Way)',
          nextStatus: 'ON_THE_WAY' as RequestStatus,
          color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          action: () => handleUpdateStatus('ON_THE_WAY'),
        };
      case 'ON_THE_WAY':
        return {
          label: '📍 Mark as Arrived at Incident Spot',
          nextStatus: 'ARRIVED' as RequestStatus,
          color: 'bg-purple-600 hover:bg-purple-700 text-white',
          action: () => handleUpdateStatus('ARRIVED'),
        };
      case 'ARRIVED':
        return {
          label: '🛠️ Begin Diagnosis & Repair (In Progress)',
          nextStatus: 'IN_PROGRESS' as RequestStatus,
          color: 'bg-amber-500 hover:bg-amber-600 text-white',
          action: () => handleUpdateStatus('IN_PROGRESS'),
        };
      case 'IN_PROGRESS':
        return {
          label: '✅ Mark Repair as Finished (Completed)',
          nextStatus: 'COMPLETED' as RequestStatus,
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          action: () => handleUpdateStatus('COMPLETED'),
        };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/shop/dashboard"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">
                Job #{request.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Received {formatDate(request.created_at)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{problemMeta.icon}</span>
              <span>{problemMeta.label} Request</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRequestDetails()}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-purple-600 rounded-xl transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <StatusBadge status={request.status} size="lg" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Actions, Controls & Breakdown Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Action Dispatch Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  Technician Action Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your job status to notify the rider in real time
                </p>
              </div>
            </div>

            {/* Main Progression Button */}
            {nextAction && (
              <button
                onClick={nextAction.action}
                disabled={updating}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 ${nextAction.color}`}
              >
                {updating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{nextAction.label}</span>
                  </>
                )}
              </button>
            )}

            {/* Quick Status Buttons Bar */}
            {request.status !== 'SEARCHING' && request.status !== 'CANCELLED' && (
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Jump to specific status
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'] as RequestStatus[]).map(
                    (st) => {
                      const isCurrent = request.status === st;
                      const labels: Record<string, string> = {
                        ON_THE_WAY: 'On The Way',
                        ARRIVED: 'Arrived',
                        IN_PROGRESS: 'In Progress',
                        COMPLETED: 'Completed',
                      };
                      return (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(st)}
                          disabled={updating || isCurrent}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            isCurrent
                              ? 'bg-purple-50 text-purple-700 border-purple-300 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {labels[st]}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Contact Rider & Direct Navigation Row */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <a
                href={getTelUrl(request.phone)}
                className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Rider ({request.phone})</span>
              </a>

              <a
                href={getNavigationUrl(request.latitude, request.longitude, 'Breakdown Location')}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs rounded-xl border border-brand-200 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-brand-600" />
                <span>Navigate to Rider GPS</span>
              </a>
            </div>
          </div>

          {/* Breakdown & Vehicle Details Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Bike className="w-5 h-5 text-purple-600" />
              <span>Rider & Motorcycle Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400">Rider Name:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{request.user_name}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400">Contact Number:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{request.phone}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                <Bike className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400">Bike Model:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {request.bike_brand} {request.bike_model} {request.bike_year ? `(${request.bike_year})` : ''}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                <div className="w-4 h-4 text-slate-400 font-mono font-bold flex-shrink-0">#</div>
                <div>
                  <span className="text-slate-400">Registration Number:</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">
                    {request.bike_registration || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {request.description && (
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs">
                <span className="font-semibold text-brand-800 block mb-1">
                  Customer Breakdown Notes:
                </span>
                <p className="text-slate-700 italic leading-relaxed">
                  &quot;{request.description}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Customer Rating Card (if completed and rated) */}
          {request.user_rating && (
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <h3 className="font-bold text-sm">Customer Review Received!</h3>
              </div>
              <p className="text-xs text-emerald-900 font-semibold">
                Rating: ⭐ {request.user_rating} / 5 Stars
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Live Map & Visual Progress (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Incident Spot Map */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Rider Breakdown Coordinates</span>
              </h3>
              {request.distance !== undefined && (
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {formatDistance(request.distance)}
                </span>
              )}
            </div>

            <Map
              center={[request.latitude, request.longitude]}
              zoom={14}
              userLocation={[request.latitude, request.longitude]}
              userLabel="Rider Incident Location"
              className="h-64 w-full rounded-2xl"
            />

            <p className="text-[11px] text-slate-500 text-center font-mono">
              Lat: {request.latitude.toFixed(4)}, Lng: {request.longitude.toFixed(4)}
            </p>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Job Progression Tracker</span>
            </h3>

            <StatusTimeline status={request.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
