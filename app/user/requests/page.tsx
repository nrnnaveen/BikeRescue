'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HelpRequest } from '@/lib/types';
import RequestCard from '@/components/RequestCard';
import {
  ListOrdered,
  AlertTriangle,
  Loader2,
  Clock,
  CheckCheck,
  XCircle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function UserRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (!res.ok) {
        if (res.status === 401) router.push('/login');
        return;
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (e) {
      console.error('Failed to load requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ACTIVE') {
      return r.status !== 'COMPLETED' && r.status !== 'CANCELLED';
    }
    if (filter === 'COMPLETED') {
      return r.status === 'COMPLETED';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Breakdown Log
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            My Assistance Requests 📋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track ongoing repairs or review past completed roadside assistance logs
          </p>
        </div>

        <Link
          href="/user/request"
          className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Help Request</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' && `All Requests (${requests.length})`}
            {tab === 'ACTIVE' &&
              `Active (${
                requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
                  .length
              })`}
            {tab === 'COMPLETED' &&
              `Completed (${requests.filter((r) => r.status === 'COMPLETED').length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <ListOrdered className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You do not have any requests in this category.
          </p>
          <Link
            href="/user/request"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Help Request</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => (
            <RequestCard key={req.id} request={req} userRole="USER" />
          ))}
        </div>
      )}
    </div>
  );
}
