'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bike } from '@/lib/types';
import BikeCard from '@/components/BikeCard';
import {
  Bike as BikeIcon,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function UserBikesPage() {
  const router = useRouter();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);

  // Form states
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState<string>('');
  const [fuelType, setFuelType] = useState<string>('Petrol');

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBikes = async () => {
    try {
      const res = await fetch('/api/bikes');
      if (!res.ok) {
        if (res.status === 401) router.push('/login');
        return;
      }
      const data = await res.json();
      setBikes(data.bikes || []);
    } catch (e) {
      console.error('Failed to fetch bikes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const openAddModal = () => {
    setEditingBike(null);
    setBrand('');
    setModel('');
    setRegistrationNumber('');
    setYear(new Date().getFullYear());
    setColor('');
    setFuelType('Petrol');
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (bike: Bike) => {
    setEditingBike(bike);
    setBrand(bike.brand);
    setModel(bike.model);
    setRegistrationNumber(bike.registration_number);
    setYear(bike.year);
    setColor(bike.color || '');
    setFuelType(bike.fuel_type || 'Petrol');
    setError(null);
    setModalOpen(true);
  };

  const handleDelete = async (bikeId: number) => {
    try {
      const res = await fetch(`/api/bikes/${bikeId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete bike');
        return;
      }
      fetchBikes();
    } catch (e) {
      console.error('Delete bike error:', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        brand,
        model,
        registration_number: registrationNumber,
        year,
        color,
        fuel_type: fuelType,
      };

      const url = editingBike ? `/api/bikes/${editingBike.id}` : '/api/bikes';
      const method = editingBike ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save bike.');
      }

      setModalOpen(false);
      fetchBikes();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Garage Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            My Registered Bikes 🏍️
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add your motorcycles or scooters to quickly request assistance during a breakdown
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bike</span>
        </button>
      </div>

      {/* Bike List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : bikes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <BikeIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No bikes added yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            Add your bike details so mechanics know exactly which vehicle and parts to bring when you request assistance.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Bike</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bikes.map((bike) => (
            <BikeCard
              key={bike.id}
              bike={bike}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Bike Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center">
                <BikeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingBike ? 'Edit Bike Details' : 'Add New Bike'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your bike specification for quick service
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Yamaha, Honda, Royal Enfield"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. MT-15, Classic 350, Activa"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. KA-01-EQ-4050"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    required
                    min={1980}
                    max={new Date().getFullYear() + 1}
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Color (Optional)
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Matte Black, Red, Blue"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric (EV)</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingBike ? 'Save Changes' : 'Add Bike'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
