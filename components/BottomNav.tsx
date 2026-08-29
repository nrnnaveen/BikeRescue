'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, AlertTriangle, Compass, Bike, ListOrdered, Wrench, User } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface BottomNavProps {
  userRole?: UserRole;
}

export default function BottomNav({ userRole = 'USER' }: BottomNavProps) {
  const pathname = usePathname();

  // Hide on auth/landing pages if preferred, or show contextual nav
  if (pathname === '/login' || pathname === '/register' || pathname === '/shop-register') {
    return null;
  }

  const isShop = userRole === 'SHOP';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 py-1.5 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {isShop ? (
          <>
            <Link
              href="/shop/dashboard"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname === '/shop/dashboard'
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Dashboard</span>
            </Link>

            <Link
              href="/shop/requests"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname.startsWith('/shop/requests')
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Requests</span>
            </Link>

            <Link
              href="/emergency"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname === '/emergency'
                  ? 'text-red-600 font-bold'
                  : 'text-slate-500 hover:text-red-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-[10px] mt-0.5 text-red-600">SOS</span>
            </Link>

            <Link
              href="/shop/profile"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname === '/shop/profile'
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Profile</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/user/dashboard"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname === '/user/dashboard'
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </Link>

            <Link
              href="/user/shops"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname === '/user/shops'
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Shops</span>
            </Link>

            {/* Prominent Help Request Action Button */}
            <Link
              href="/user/request"
              className="flex flex-col items-center -mt-5 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ring-4 ring-white">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-extrabold text-brand-600 mt-0.5">
                HELP
              </span>
            </Link>

            <Link
              href="/user/bikes"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname === '/user/bikes'
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bike className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Bikes</span>
            </Link>

            <Link
              href="/user/requests"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                pathname.startsWith('/user/requests')
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">History</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
