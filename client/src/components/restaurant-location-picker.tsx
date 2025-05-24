'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 40.7128, lng: -74.006 }; // Default to New York City

interface RestaurantLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

export default function RestaurantLocationPicker({
  initialLat,
  initialLng,
  onLocationSelect,
}: RestaurantLocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const center = initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    // Clear any Google Maps event listeners
    if (map) {
      google.maps.event.clearInstanceListeners(map);
    }
  }, [map]);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        onLocationSelect({ lat, lng });
      }
    },
    [onLocationSelect]
  );

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        onLocationSelect({ lat, lng });
      }
    },
    [onLocationSelect]
  );

  useEffect(() => {
    // Sync marker position with initial coordinates
    if (initialLat && initialLng && !markerPosition) {
      setMarkerPosition({ lat: initialLat, lng: initialLng });
      onLocationSelect({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng, markerPosition, onLocationSelect]);

  if (loadError) {
    return <div className="flex h-full w-full items-center justify-center">Error loading map</div>;
  }

  if (!isLoaded) {
    return <div className="flex h-full w-full items-center justify-center">Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onMapClick}
    >
      {markerPosition && (
        <Marker
          position={markerPosition}
          draggable
          animation={google.maps.Animation.DROP}
          onDragEnd={onMarkerDragEnd}
        />
      )}
    </GoogleMap>
  );
}