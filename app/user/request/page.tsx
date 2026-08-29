'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bike, BikeProblem, Shop, UserSafe } from '@/lib/types';
import { getCurrentPosition, DEFAULT_COORDINATES } from '@/lib/location';
import { getProblemDetails } from '@/lib/utils';
import Map from '@/components/Map';
import {
  AlertTriangle,
  Bike as BikeIcon,
  MapPin,
  Phone,
  FileText,
  Navigation,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Compass,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const PROBLEMS: BikeProblem[] = [
  'Puncture',
  'Battery',
  'Engine',
  'Brake',
  'Tyre',
  'Chain',
  'Electrical',
  'Fuel',
  'Accident',
  'Other',
];

function RequestHelpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProblem = searchParams.get('problem') as BikeProblem | null;

  const [user, setUser] = useState<UserSafe | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<number | null>(null);
  const [problem, setProblem] = useState<BikeProblem>(
    preselectedProblem && PROBLEMS.includes(preselectedProblem)
      ? preselectedProblem
      : 'Puncture'
  );
  const [description, setDescription] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(DEFAULT_COORDINATES.latitude);
  const [longitude, setLongitude] = useState<number>(DEFAULT_COORDINATES.longitude);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [locating, setLocating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [authRes, bikeRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/bikes'),
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
        setPhone(authData.user.phone || '');

        if (bikeRes.ok) {
          const bikeData = await bikeRes.json();
          const userBikes = bikeData.bikes || [];
          setBikes(userBikes);
          if (userBikes.length > 0) {
            setSelectedBikeId(userBikes[0].id);
          }
        }

        // Try getting initial GPS location gently
        try {
          const pos = await getCurrentPosition({ timeout: 8000 });
          setLatitude(pos.latitude);
          setLongitude(pos.longitude);
          setGpsSuccess(true);
          fetchNearbyShops(pos.latitude, pos.longitude);
        } catch (e) {
          // Default fallback
          fetchNearbyShops(DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude);
        }
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const fetchNearbyShops = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/shops?lat=${lat}&lng=${lng}&radius=20`);
      if (res.ok) {
        const data = await res.json();
        setNearbyShops(data.shops || []);
      }
    } catch (e) {
      console.error('Failed to fetch nearby shops:', e);
    }
  };

  const handleFetchGps = async () => {
    setLocating(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      setLatitude(pos.latitude);
      setLongitude(pos.longitude);
      setGpsSuccess(true);
      fetchNearbyShops(pos.latitude, pos.longitude);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve your current location.');
    } finally {
      setLocating(false);
    }
  };

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLatitude(newLat);
    setLongitude(newLng);
    fetchNearbyShops(newLat, newLng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBikeId) {
      setError('Please add or select a bike to proceed.');
      return;
    }

    if (!phone.trim()) {
      setError('Contact phone number is required so the technician can call you.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bike_id: selectedBikeId,
          problem,
          description,
          phone,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit help request');
      }

      // Redirect immediately to live tracking page
      router.push(`/user/requests/${data.request.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3.5 py-1 rounded-full text-xs font-bold mb-3 animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span>Roadside Breakdown Request</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Request Mechanical Help
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tell us about your breakdown and we will dispatch the nearest available workshop
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Bike Selector */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-black">
                1
              </span>
              <span>Select Your Bike</span>
            </h3>

            <Link
              href="/user/bikes"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Bike</span>
            </Link>
          </div>

          {bikes.length === 0 ? (
            <div className="p-5 bg-orange-50/60 border border-orange-200 rounded-2xl text-center">
              <p className="text-xs text-slate-700 font-medium mb-3">
                You have not registered any bikes yet.
              </p>
              <Link
                href="/user/bikes"
                className="inline-flex items-center gap-1.5 bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-brand-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bike Now</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {bikes.map((b) => {
                const isSelected = selectedBikeId === b.id;
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setSelectedBikeId(b.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 ring-2 ring-brand-100 bg-orange-50/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-xs text-slate-900">
                        {b.brand} {b.model}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] font-mono font-semibold text-slate-600 mt-1">
                      {b.registration_number}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Breakdown Problem */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-black">
              2
            </span>
            <span>Select Breakdown Problem</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {PROBLEMS.map((prob) => {
              const meta = getProblemDetails(prob);
              const isSelected = problem === prob;
              return (
                <button
                  type="button"
                  key={prob}
                  onClick={() => setProblem(prob)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/70 text-brand-900 ring-2 ring-brand-100 font-bold shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{meta.icon}</span>
                  <span className="text-xs">{prob}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Problem Description (Optional details for the mechanic)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Rear tyre got punctured by a nail near metro pillar 142. Self-starter also clicking."
              className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* 3. Location & GPS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-black">
                3
              </span>
              <span>Breakdown Location</span>
            </h3>

            <button
              type="button"
              onClick={handleFetchGps}
              disabled={locating}
              className="inline-flex items-center justify-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto"
            >
              {locating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
              )}
              <span>{locating ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Drag the pin on the map or click &quot;Use My Current Location&quot; to adjust your incident spot.
          </p>

          {/* Interactive Leaflet Map */}
          <div className="relative">
            <Map
              center={[latitude, longitude]}
              zoom={14}
              userLocation={[latitude, longitude]}
              userLabel="Breakdown Incident Spot (Drag to adjust)"
              draggableUserMarker={true}
              onLocationChange={handleLocationChange}
              shops={nearbyShops}
              className="h-64 sm:h-80 w-full rounded-2xl"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>
              Coordinates: <b className="text-slate-700 font-mono">{latitude.toFixed(4)}, {longitude.toFixed(4)}</b>
            </span>
            <span className="text-emerald-600 font-semibold">
              {nearbyShops.length} mechanics in range
            </span>
          </div>
        </div>

        {/* 4. Phone Confirmation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-black">
              4
            </span>
            <span>Contact Phone Number</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone number for mechanic to call you
            </label>
            <div className="relative max-w-sm">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || bikes.length === 0}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                <span>SEND HELP REQUEST NOW</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RequestHelpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      }
    >
      <RequestHelpContent />
    </Suspense>
  );
}
