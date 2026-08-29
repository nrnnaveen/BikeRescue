import React from 'react';
import { HelpRequest, UserRole } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { formatDate, getProblemDetails } from '@/lib/utils';
import { formatDistance } from '@/lib/distance';
import { getTelUrl } from '@/lib/location';
import { Phone, ArrowRight, Check, X, ShieldAlert, Bike, User, MapPin } from 'lucide-react';
import Link from 'next/link';

interface RequestCardProps {
  request: HelpRequest;
  userRole?: UserRole;
  onAccept?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
  isAccepting?: boolean;
}

export default function RequestCard({
  request,
  userRole = 'USER',
  onAccept,
  onReject,
  isAccepting = false,
}: RequestCardProps) {
  const problemMeta = getProblemDetails(request.problem);
  const isShop = userRole === 'SHOP';
  const detailLink = isShop
    ? `/shop/requests/${request.id}`
    : `/user/requests/${request.id}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top bar: Problem badge & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={request.problem}>
              {problemMeta.icon}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-600 transition-colors">
                {problemMeta.label}
              </h3>
              <p className="text-[11px] text-slate-400">
                {formatDate(request.created_at)}
              </p>
            </div>
          </div>

          <StatusBadge status={request.status} size="sm" />
        </div>

        {/* Bike Details */}
        <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Bike className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>
              {request.bike_brand} {request.bike_model}
            </span>
          </div>
          {request.bike_registration && (
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono font-bold text-slate-800 text-[11px]">
              {request.bike_registration}
            </span>
          )}
        </div>

        {/* Description */}
        {request.description && (
          <p className="text-xs text-slate-600 mb-3 italic bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
            &quot;{request.description}&quot;
          </p>
        )}

        {/* Location & Distance Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-4">
          {request.distance !== undefined && (
            <div className="flex items-center gap-1 font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              <MapPin className="w-3.5 h-3.5" />
              <span>{formatDistance(request.distance)}</span>
            </div>
          )}

          {isShop && request.user_name && (
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Rider: {request.user_name}</span>
            </div>
          )}

          {!isShop && request.shop_name && (
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <span>Mechanic: <b>{request.shop_name}</b></span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-auto">
        {/* Incoming Open Request on Shop view */}
        {isShop && request.status === 'SEARCHING' && onAccept ? (
          <>
            <button
              onClick={() => onAccept(request.id)}
              disabled={isAccepting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{isAccepting ? 'Accepting...' : 'Accept Request'}</span>
            </button>

            {onReject && (
              <button
                onClick={() => onReject(request.id)}
                className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                title="Decline"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            {/* Quick Call Button */}
            {(request.phone || request.shop_phone) && (
              <a
                href={getTelUrl(isShop ? request.phone : request.shop_phone || request.phone)}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl transition-colors border border-slate-200"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call</span>
              </a>
            )}

            {/* View Tracking / Action Center */}
            <Link
              href={detailLink}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-colors"
            >
              <span>{isShop ? 'Manage Job' : 'Track Progress'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
