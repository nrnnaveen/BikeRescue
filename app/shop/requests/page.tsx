'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HelpRequest } from '@/lib/types';
import RequestCard from '@/components/RequestCard';
import {
  ListOrdered,
  Clock,
  Wrench,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function ShopRequestsListPage() {
  const router = useRouter();
  const [assigned, setAssigned] = useState<HelpRequest[]>([]);
  const [incoming, setIncoming] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'ACTIVE' | 'COMPLETED' | 'ALL'>('INCOMING');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (!res.ok) {
        if (res.status === 401) router.push('/login');
        return;
      }
      const data = await res.json();
      setAssigned(data.assigned || []);
      setIncoming(data.incoming || []);
    } catch (e) {
      console.error('Failed to load shop requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptRequest = async (requestId: number) => {
    setActionLoadingId(requestId);
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
      router.push(`/shop/requests/${requestId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = (requestId: number) => {
    setIncoming(incoming.filter((r) => r.id !== requestId));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const activeJobs = assigned.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  );
  const completedJobs = assigned.filter((r) => r.status === 'COMPLETED');

  let displayRequests: HelpRequest[] = [];
  if (activeTab === 'INCOMING') displayRequests = incoming;
  else if (activeTab === 'ACTIVE') displayRequests = activeJobs;
  else if (activeTab === 'COMPLETED') displayRequests = completedJobs;
  else displayRequests = [...incoming, ...assigned];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            Workshop Jobs Feed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            All Assistance Requests 📋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage incoming open breakdown alerts, active technician jobs, and historical repairs
          </p>
        </div>

        <button
          onClick={() => fetchRequests()}
          className="p-3 bg-white border border-slate-200 text-slate-700 hover:text-purple-600 rounded-2xl transition-colors shadow-sm self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Jobs</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'INCOMING', label: `Incoming Nearby (${incoming.length})` },
          { id: 'ACTIVE', label: `In Progress (${activeJobs.length})` },
          { id: 'COMPLETED', label: `Completed (${completedJobs.length})` },
          { id: 'ALL', label: `All (${incoming.length + assigned.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {displayRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md mx-auto my-8 shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No requests in this category</h3>
          <p className="text-xs text-slate-500 mt-1">
            New requests will appear automatically as riders report roadside issues.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              userRole="SHOP"
              onAccept={handleAcceptRequest}
              onReject={handleDeclineRequest}
              isAccepting={actionLoadingId === req.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
