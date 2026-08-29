'use client';

import React, { useState, useEffect } from 'react';
import { Shop } from '@/lib/types';
import { getCurrentPosition, DEFAULT_COORDINATES } from '@/lib/location';
import ShopCard from '@/components/ShopCard';
import Map from '@/components/Map';
import {
  Compass,
  MapPin,
  Navigation,
  Loader2,
  Filter,
  AlertCircle,
  Building2,
  Search,
} from 'lucide-react';

export default function NearbyShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<number>(DEFAULT_COORDINATES.latitude);
  const [longitude, setLongitude] = useState<number>(DEFAULT_COORDINATES.longitude);
  const [radius, setRadius] = useState<number>(20);
  const [locating, setLocating] = useState<boolean>(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  const fetchShops = async (lat: number, lng: number, rad: number, avail: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shops?lat=${lat}&lng=${lng}&radius=${rad}&only_available=${avail}`
      );
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
      }
    } catch (e) {
      console.error('Failed to load nearby shops:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchShops(latitude, longitude, radius, onlyAvailable);

    // Try detecting GPS on mount
    getCurrentPosition({ timeout: 6000 })
      .then((pos) => {
        setLatitude(pos.latitude);
        setLongitude(pos.longitude);
        fetchShops(pos.latitude, pos.longitude, radius, onlyAvailable);
      })
      .catch(() => {
        // Fallback default coordinates
      });
  }, []);

  const handleFetchGps = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLatitude(pos.latitude);
      setLongitude(pos.longitude);
      fetchShops(pos.latitude, pos.longitude, radius, onlyAvailable);
    } catch (err: any) {
      alert(err.message || 'Could not retrieve GPS coordinates.');
    } finally {
      setLocating(false);
    }
  };

  const handleRadiusChange = (newRad: number) => {
    setRadius(newRad);
    fetchShops(latitude, longitude, newRad, onlyAvailable);
  };

  const handleAvailableToggle = () => {
    const next = !onlyAvailable;
    setOnlyAvailable(next);
    fetchShops(latitude, longitude, radius, next);
  };

  const filteredShops = shops.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.shop_name.toLowerCase().includes(q) ||
      s.owner_name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.services.some((srv) => srv.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Workshop Locator
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Nearby Mechanical Shops 📍
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified workshops within your vicinity, check services, ratings, and call directly
          </p>
        </div>

        <button
          onClick={handleFetchGps}
          disabled={locating}
          className="inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md transition-all self-start sm:self-auto"
        >
          {locating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{locating ? 'Locating...' : 'Update My GPS'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop name, service, or area..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Radius Filters & Available Toggle */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {[5, 10, 20, 50].map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  radius === r
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r} KM
              </button>
            ))}
          </div>

          <button
            onClick={handleAvailableToggle}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              onlyAvailable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ● Available Only
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-brand-600" />
            <span>Interactive Workshop Map</span>
          </h3>
          <span className="text-xs text-slate-500">
            Showing <b>{filteredShops.length}</b> workshops on radar
          </span>
        </div>

        <Map
          center={[latitude, longitude]}
          zoom={13}
          userLocation={[latitude, longitude]}
          userLabel="Your Position"
          shops={filteredShops}
          selectedShopId={selectedShop?.id}
          onSelectShop={(shop) => setSelectedShop(shop)}
          className="h-72 sm:h-96 w-full rounded-2xl"
        />
      </div>

      {/* Shops Grid */}
      <div>
        <h2 className="font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-600" />
          <span>Mechanic Workshops in Your Area</span>
        </h2>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No mechanics found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try expanding your search radius to 20 KM or 50 KM to find more available shops.
            </p>
            <button
              onClick={() => handleRadiusChange(50)}
              className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-600"
            >
              Expand to 50 KM
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onViewOnMap={(s) => setSelectedShop(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
