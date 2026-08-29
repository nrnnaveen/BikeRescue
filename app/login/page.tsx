'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import {
  Bike,
  Wrench,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('USER');
  const [email, setEmail] = useState<string>('rider@bikerescue.com');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'USER') {
      setEmail('rider@bikerescue.com');
      setPassword('password123');
    } else {
      setEmail('abc@bikerescue.com');
      setPassword('password123');
    }
  };

  const setDemoAccount = (demoEmail: string, demoRole: UserRole) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user.role === 'SHOP') {
        router.push('/shop/dashboard');
      } else {
        router.push('/user/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
            <Bike className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Sign in to BikeRescue
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Roadside assistance network for riders & mechanical workshops
          </p>
        </div>

        {/* Demo Quick-Fill Bar */}
        <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3.5 text-xs text-slate-700 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-brand-800 mb-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>1-Click Demo Accounts (Instant Test)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('rider@bikerescue.com', 'USER')}
              className={`p-2 rounded-xl border text-left transition-all ${
                role === 'USER' && email === 'rider@bikerescue.com'
                  ? 'bg-white border-brand-500 ring-2 ring-brand-100 font-bold text-brand-700'
                  : 'bg-white/80 border-orange-200 text-slate-700 hover:bg-white'
              }`}
            >
              <p className="font-semibold text-[11px] flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-brand-600" />
                <span>Rider (Naveen)</span>
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">rider@bikerescue.com</p>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('abc@bikerescue.com', 'SHOP')}
              className={`p-2 rounded-xl border text-left transition-all ${
                role === 'SHOP' && email === 'abc@bikerescue.com'
                  ? 'bg-white border-brand-500 ring-2 ring-brand-100 font-bold text-brand-700'
                  : 'bg-white/80 border-orange-200 text-slate-700 hover:bg-white'
              }`}
            >
              <p className="font-semibold text-[11px] flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-brand-600" />
                <span>Shop (ABC Bike)</span>
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">abc@bikerescue.com</p>
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleSwitch('USER')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'USER'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bike className="w-4 h-4 text-brand-600" />
              <span>Bike Rider</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('SHOP')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'SHOP'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-purple-600" />
              <span>Mechanical Shop</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In as {role === 'USER' ? 'Rider' : 'Shop'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Links */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs">
            <p className="text-slate-500 font-medium">Don&apos;t have an account?</p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
              >
                Create User Account
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/shop-register"
                className="text-purple-600 hover:text-purple-700 font-bold hover:underline"
              >
                Register Mechanical Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
