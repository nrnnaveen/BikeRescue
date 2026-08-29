import React from 'react';
import { Shop } from '@/lib/types';
import { formatDistance } from '@/lib/distance';
import { getTelUrl } from '@/lib/location';
import { Phone, Star, MapPin, Wrench, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface ShopCardProps {
  shop: Shop;
  onRequestHelp?: (shop: Shop) => void;
  onViewOnMap?: (shop: Shop) => void;
  showActions?: boolean;
}

export default function ShopCard({
  shop,
  onRequestHelp,
  onViewOnMap,
  showActions = true,
}: ShopCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Shop Name & Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
              <span>{shop.shop_name}</span>
              {shop.rating >= 4.7 && (
                <span title="Top Rated Mechanic">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <span>Owner: {shop.owner_name}</span>
            </p>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
              shop.is_available
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                shop.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {shop.is_available ? 'Available' : 'Offline'}
          </span>
        </div>

        {/* Rating & Distance */}
        <div className="flex items-center gap-3 text-xs mb-3">
          <div className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{shop.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({shop.rating_count})</span>
          </div>

          {shop.distance !== undefined && (
            <div className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{formatDistance(shop.distance)}</span>
            </div>
          )}
        </div>

        {/* Address */}
        <p className="text-xs text-slate-600 mb-3 flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{shop.address}</span>
        </p>

        {/* Services Badges */}
        {shop.services && shop.services.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Services Offered
            </p>
            <div className="flex flex-wrap gap-1.5">
              {shop.services.slice(0, 5).map((service, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
                >
                  {service}
                </span>
              ))}
              {shop.services.length > 5 && (
                <span className="text-[11px] text-slate-400 px-1 py-0.5">
                  +{shop.services.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-auto">
          {/* Call Button */}
          <a
            href={getTelUrl(shop.phone)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl transition-colors border border-slate-200"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>Call</span>
          </a>

          {/* Map / Focus Button */}
          {onViewOnMap && (
            <button
              onClick={() => onViewOnMap(shop)}
              className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
              title="Locate on Map"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Request Help Button */}
          {onRequestHelp ? (
            <button
              onClick={() => onRequestHelp(shop)}
              disabled={!shop.is_available}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-all ${
                shop.is_available
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Request Help</span>
            </button>
          ) : (
            <Link
              href={`/user/request?shop_id=${shop.id}`}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-all ${
                shop.is_available
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-slate-200 text-slate-400 pointer-events-none'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Request Help</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
