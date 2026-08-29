export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  loading: boolean;
  coordinates: LocationCoordinates | null;
  error: string | null;
  permissionStatus?: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

export const DEFAULT_COORDINATES: LocationCoordinates = {
  latitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT || 12.9716),
  longitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG || 77.5946),
};

export function getCurrentPosition(
  options?: PositionOptions
): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'An unknown error occurred while retrieving your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access was denied. Please enable location permissions in your browser so we can find nearby mechanics.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable. Please check your GPS signal or try again.';
            break;
          case error.TIMEOUT:
            message = 'The request to get your location timed out. Please try again.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: options?.timeout || 12000,
        maximumAge: options?.maximumAge || 10000,
      }
    );
  });
}

/**
 * Generate navigation URL to open external map for directions
 */
export function getNavigationUrl(lat: number, lng: number, label?: string): string {
  // Uses Google Maps Universal Directions URL which works across Android, iOS and Web
  const encodedLabel = label ? encodeURIComponent(label) : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedLabel}`;
}

/**
 * Generate phone call URI
 */
export function getTelUrl(phone: string): string {
  // Strip non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}
