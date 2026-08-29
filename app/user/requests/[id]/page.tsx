'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HelpRequest } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import StatusTimeline from '@/components/StatusTimeline';
import RatingModal from '@/components/RatingModal';
import Map from '@/components/Map';
import { getProblemDetails, formatDate } from '@/lib/utils';
import { formatDistance } from '@/lib/distance';
import { getTelUrl, getNavigationUrl } from '@/lib/location';
import {
  Bike,
  Phone,
  Navigation,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function UserRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    const interval = setInterval(fetchRequestDetails, 5000); // Polling for rapid demo updates
    return () => clearInterval(interval);
  }, [requestId]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this assistance request?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel request');
        return;
      }
      setRequest(data.request);
    } catch (e) {
      console.error('Cancel request error:', e);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Request Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested assistance ticket could not be located.
        </p>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-2 bg-brand-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const problemMeta = getProblemDetails(request.problem);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/user/requests"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">
                Ticket #{request.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {formatDate(request.created_at)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{problemMeta.icon}</span>
              <span>{problemMeta.label} Assistance</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRequestDetails()}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-brand-600 rounded-xl transition-colors shadow-sm"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <StatusBadge status={request.status} size="lg" />
        </div>
      </div>

      {/* Main Grid: Left Timeline/Details, Right Map/Mechanic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Progress Timeline & Breakdown Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress Timeline Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                <span>Live Service Progress</span>
              </h2>
              {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full animate-pulse">
                  ● Realtime Tracking
                </span>
              )}
            </div>

            <StatusTimeline
              status={request.status}
              shopName={request.shop_name}
              createdAt={request.created_at}
              updatedAt={request.updated_at}
            />

            {/* Cancel Action if applicable */}
            {request.status === 'SEARCHING' && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Help Request'}
                </button>
              </div>
            )}
          </div>

          {/* Breakdown Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Bike className="w-5 h-5 text-brand-600" />
              <span>Vehicle & Breakdown Details</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400">Bike Model:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {request.bike_brand} {request.bike_model}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400">Registration:</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">
                  {request.bike_registration || 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400">Your Phone:</span>
                <p className="font-bold text-slate-800 mt-0.5">{request.phone}</p>
              </div>
            </div>

            {request.description && (
              <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs">
                <span className="font-semibold text-brand-800 block mb-1">
                  Reported Problem Description:
                </span>
                <p className="text-slate-700 leading-relaxed italic">
                  &quot;{request.description}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assigned Mechanic & Incident Map (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mechanic Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Assigned Repair Shop</span>
            </h2>

            {request.shop_id && request.shop_name ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {request.shop_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Technician: <b>{request.shop_owner || 'Mechanic'}</b>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{request.shop_address}</span>
                    </p>
                  </div>

                  {request.shop_rating && (
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-xs font-bold text-amber-700 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{request.shop_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Distance */}
                {request.distance !== undefined && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs flex items-center justify-between text-emerald-900">
                    <span className="font-medium">Estimated Distance:</span>
                    <span className="font-bold">{formatDistance(request.distance)}</span>
                  </div>
                )}

                {/* Contact & Navigation Actions */}
                <div className="flex gap-2 pt-2">
                  {request.shop_phone && (
                    <a
                      href={getTelUrl(request.shop_phone)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Mechanic</span>
                    </a>
                  )}

                  <a
                    href={getNavigationUrl(
                      request.shop_latitude || request.latitude,
                      request.shop_longitude || request.longitude
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
                    title="Open Navigation"
                  >
                    <Navigation className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
                  <Clock className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Broadcasting Breakdown to Local Mechanics...
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Available repair workshops in your area have been notified. The first technician to accept will be dispatched to your location.
                </p>
              </div>
            )}
          </div>

          {/* Rating Action Card (if completed) */}
          {request.status === 'COMPLETED' && (
            <div className="bg-gradient-to-tr from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-300 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <h3 className="font-bold text-sm">Service Completed!</h3>
              </div>

              {request.user_rating ? (
                <div className="bg-white p-3.5 rounded-2xl border border-amber-200 text-xs">
                  <div className="flex items-center gap-1 text-amber-600 font-bold mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (request.user_rating || 0)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-slate-700 font-semibold">
                      Your Rating: {request.user_rating} / 5
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Thank you for reviewing {request.shop_name}!
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600">
                    Your repair is finished. Please rate your technician to help fellow riders!
                  </p>
                  <button
                    onClick={() => setRatingModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-colors"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    <span>Rate This Repair (1-5 Stars)</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Live Incident Location Map */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Location Radar</span>
            </h3>

            <Map
              center={[request.latitude, request.longitude]}
              zoom={14}
              userLocation={[request.latitude, request.longitude]}
              userLabel="Your Breakdown Spot"
              incidentLocation={
                request.shop_latitude && request.shop_longitude
                  ? [request.shop_latitude, request.shop_longitude]
                  : undefined
              }
              incidentLabel={request.shop_name || 'Assigned Mechanic'}
              className="h-64 w-full rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {request.shop_name && (
        <RatingModal
          requestId={request.id}
          shopName={request.shop_name}
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          onSuccess={() => fetchRequestDetails()}
        />
      )}
    </div>
  );
}
