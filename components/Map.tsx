'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Shop } from '@/lib/types';
import { formatDistance, calculateDistance } from '@/lib/distance';

interface MapProps {
  center: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  userLabel?: string;
  draggableUserMarker?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  shops?: Shop[];
  selectedShopId?: number | null;
  onSelectShop?: (shop: Shop) => void;
  incidentLocation?: [number, number] | null;
  incidentLabel?: string;
  className?: string;
}

export default function Map({
  center,
  zoom = 13,
  userLocation,
  userLabel = 'Your Location',
  draggableUserMarker = false,
  onLocationChange,
  shops = [],
  selectedShopId,
  onSelectShop,
  incidentLocation,
  incidentLabel = 'Breakdown Location',
  className = 'h-72 w-full rounded-2xl',
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically require leaflet on client
    const L = require('leaflet');

    // Fix default leaflet icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    map.setView(center, zoom);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Custom SVG icon generator
    const createCustomIcon = (
      bgColor: string,
      iconEmoji: string,
      isPulsing: boolean = false
    ) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: ${bgColor};
            color: white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2.5px solid white;
            font-size: 18px;
            cursor: pointer;
          ">
            ${iconEmoji}
            ${
              isPulsing
                ? `<div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: ${bgColor};
                    opacity: 0.5;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });
    };

    // User Location Marker
    if (userLocation) {
      const userIcon = createCustomIcon('#ea580c', '📍', true);
      const userMarker = L.marker(userLocation, {
        icon: userIcon,
        draggable: draggableUserMarker,
      }).addTo(map);

      userMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 2px;">
          <b style="color: #ea580c; font-size: 13px;">${userLabel}</b>
          ${
            draggableUserMarker
              ? '<p style="font-size: 11px; color: #64748b; margin-top: 2px;">Drag to adjust location</p>'
              : ''
          }
        </div>
      `);

      if (draggableUserMarker && onLocationChange) {
        userMarker.on('dragend', (e: any) => {
          const latLng = e.target.getLatLng();
          onLocationChange(latLng.lat, latLng.lng);
        });
      }

      markersRef.current.push(userMarker);
    }

    // Incident / Breakdown Location Marker
    if (incidentLocation) {
      const incidentIcon = createCustomIcon('#dc2626', '🚨', true);
      const incidentMarker = L.marker(incidentLocation, {
        icon: incidentIcon,
      }).addTo(map);

      incidentMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif;">
          <b style="color: #dc2626; font-size: 13px;">🚨 ${incidentLabel}</b>
        </div>
      `);

      markersRef.current.push(incidentMarker);
    }

    // Mechanical Shop Markers
    shops.forEach((shop) => {
      const isSelected = selectedShopId === shop.id;
      const shopIcon = createCustomIcon(
        shop.is_available ? (isSelected ? '#15803d' : '#16a34a') : '#64748b',
        '🔧'
      );

      const shopMarker = L.marker([shop.latitude, shop.longitude], {
        icon: shopIcon,
      }).addTo(map);

      let distanceStr = '';
      if (userLocation) {
        const d = calculateDistance(
          userLocation[0],
          userLocation[1],
          shop.latitude,
          shop.longitude
        );
        distanceStr = `<p style="font-size: 11px; color: #64748b; margin: 2px 0;">📍 ${formatDistance(d)}</p>`;
      }

      shopMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 180px;">
          <h4 style="font-weight: 700; font-size: 13px; margin: 0; color: #0f172a;">${shop.shop_name}</h4>
          <p style="font-size: 11px; color: #059669; font-weight: 600; margin: 2px 0;">⭐ ${shop.rating.toFixed(1)} (${shop.rating_count} reviews)</p>
          ${distanceStr}
          <p style="font-size: 11px; color: #334155; margin: 2px 0;">📞 ${shop.phone}</p>
          <p style="font-size: 10px; color: ${shop.is_available ? '#16a34a' : '#dc2626'}; font-weight: 600; margin-top: 4px;">
            ${shop.is_available ? '● Available' : '○ Offline'}
          </p>
        </div>
      `);

      if (onSelectShop) {
        shopMarker.on('click', () => onSelectShop(shop));
      }

      markersRef.current.push(shopMarker);
    });

    // Auto-fit bounds if we have multiple points
    if (markersRef.current.length > 1) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      // Clean up markers
    };
  }, [
    center,
    zoom,
    userLocation,
    userLabel,
    draggableUserMarker,
    shops,
    selectedShopId,
    incidentLocation,
    incidentLabel,
  ]);

  return (
    <div className="relative overflow-hidden shadow-inner border border-slate-200 rounded-2xl bg-slate-100">
      <div ref={mapContainerRef} className={className} />
    </div>
  );
}
