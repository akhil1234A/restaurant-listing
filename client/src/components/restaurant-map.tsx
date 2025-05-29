'use client';

import { useCallback, useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';

const containerStyle = {
  width: '100%',
  height: '400px',
};

interface RestaurantMapProps {
  latitude?: number;
  longitude?: number;
  name: string;
}

export default function RestaurantMap({ latitude, longitude, name }: RestaurantMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    if (latitude != null && longitude != null) {
      const newMarker = new google.maps.Marker({
        map: mapInstance,
        position: { lat: latitude, lng: longitude },
        title: name,
      });
      setMarker(newMarker);
    }
  }, [latitude, longitude, name]);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (marker) {
      marker.setMap(null);
    }
    if (map) {
      google.maps.event.clearInstanceListeners(map);
    }
  }, [map, marker]);

  if (latitude == null || longitude == null) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center text-gray-600">
        Location not available
      </div>
    );
  }

  const position = { lat: latitude, lng: longitude };
  const googleMapsUrl = `https://www.google.com/maps/@${latitude},${longitude},15z`;

  return (
    <div className="relative" role="region" aria-label={`Map showing location of ${name}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          draggable: true,
          disableDefaultUI: false,
          streetViewControl: true,
          mapTypeControl: true,
        }}
      />
      <div className="absolute bottom-4 left-4">
        <Button asChild variant="secondary">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
        </Button>
      </div>
    </div>
  );
}