import React from 'react';
import { Bike } from '@/lib/types';
import { Bike as BikeIcon, Fuel, Calendar, Edit3, Trash2, Shield } from 'lucide-react';

interface BikeCardProps {
  bike: Bike;
  onEdit?: (bike: Bike) => void;
  onDelete?: (bikeId: number) => void;
  isDeleting?: boolean;
  selected?: boolean;
  onSelect?: (bike: Bike) => void;
}

export default function BikeCard({
  bike,
  onEdit,
  onDelete,
  isDeleting = false,
  selected = false,
  onSelect,
}: BikeCardProps) {
  return (
    <div
      onClick={() => onSelect && onSelect(bike)}
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-100 shadow-md'
          : 'border-slate-200 shadow-sm hover:shadow-md'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div>
        {/* Header with Icon and Registration Number */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-600">
              <BikeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {bike.brand} {bike.model}
              </h3>
              {bike.color && (
                <p className="text-xs text-slate-500 capitalize">{bike.color}</p>
              )}
            </div>
          </div>

          <span className="font-mono font-bold bg-slate-100 border border-slate-300 text-slate-800 text-xs px-2.5 py-1 rounded-lg">
            {bike.registration_number}
          </span>
        </div>

        {/* Specs Meta */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Year: <b>{bike.year}</b></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
            <Fuel className="w-3.5 h-3.5 text-slate-400" />
            <span>Fuel: <b>{bike.fuel_type || 'Petrol'}</b></span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bike);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to remove ${bike.brand} ${bike.model}?`)) {
                  onDelete(bike.id);
                }
              }}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
