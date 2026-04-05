/**
 * Business Map Component
 * Displays business location on an interactive map using Leaflet
 * Lazy-loaded for performance
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load map components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <MapSkeleton /> }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface BusinessMapProps {
  businessName: string;
  latitude: number;
  longitude: number;
  address?: string;
  className?: string;
}

/**
 * Map skeleton loading state
 */
function MapSkeleton() {
  return (
    <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Loading map...</div>
    </div>
  );
}

/**
 * Fallback for missing coordinates
 */
function MapFallback({ businessName, address }: { businessName: string; address?: string }) {
  return (
    <div className="w-full h-full bg-muted rounded-lg flex flex-col items-center justify-center p-6 text-center">
      <svg
        className="w-12 h-12 text-muted-foreground mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <p className="text-sm text-muted-foreground mb-1">Location unavailable</p>
      {address && (
        <p className="text-xs text-muted-foreground">{address}</p>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          businessName + (address ? ' ' + address : '')
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-xs text-primary hover:underline"
      >
        View on Google Maps →
      </a>
    </div>
  );
}

/**
 * Business Map Component
 */
export function BusinessMap({
  businessName,
  latitude,
  longitude,
  address,
  className = '',
}: BusinessMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Load Leaflet CSS
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  // Validate coordinates
  if (
    !latitude ||
    !longitude ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return <MapFallback businessName={businessName} address={address} />;
  }

  // Don't render map on server
  if (!isClient) {
    return <MapSkeleton />;
  }

  // Show fallback if map failed to load
  if (mapError) {
    return <MapFallback businessName={businessName} address={address} />;
  }

  try {
    return (
      <div className={`relative ${className}`} style={{ minHeight: '300px' }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full rounded-lg"
          style={{ height: '100%', minHeight: '300px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">{businessName}</p>
                {address && <p className="text-xs text-muted-foreground">{address}</p>}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  Get Directions →
                </a>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error('Map rendering error:', error);
    setMapError(true);
    return <MapFallback businessName={businessName} address={address} />;
  }
}

/**
 * Mini map for cards/hover states (smaller, no interactions)
 */
export function MiniBusinessMap({
  latitude,
  longitude,
  className = '',
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !latitude || !longitude) {
    return (
      <div className={`bg-muted animate-pulse ${className}`} style={{ minHeight: '120px' }} />
    );
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: '120px', pointerEvents: 'none' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        className="w-full h-full rounded"
        style={{ height: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} />
      </MapContainer>
    </div>
  );
}
