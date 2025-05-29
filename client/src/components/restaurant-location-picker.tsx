'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = { lat: 11.258753, lng: 75.780411 };

interface RestaurantLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationSelect: (location: { lat: number; lng: number; address: string; city: string; pinCode: string }) => void;
}

export default function RestaurantLocationPicker({
  initialLat,
  initialLng,
  initialAddress = '',
  onLocationSelect,
}: RestaurantLocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null
  );
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const center = initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : defaultCenter;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (map) {
      google.maps.event.clearInstanceListeners(map);
    }
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
  }, [map]);

  const updateMarker = useCallback(
    (lat: number, lng: number) => {
      if (map) {
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          markerRef.current = new google.maps.Marker({
            map,
            position: { lat, lng },
            draggable: true,
          });
          markerRef.current.addListener('dragend', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const newLat = e.latLng.lat();
              const newLng = e.latLng.lng();
              setMarkerPosition({ lat: newLat, lng: newLng });
              reverseGeocode(newLat, newLng);
              map.panTo({ lat: newLat, lng: newLng });
            }
          });
        }
      }
    },
    [map]
  );

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results[0]) {
          const result = response.results[0];
          const formattedAddress = result.formatted_address;
          let city = '';
          let pinCode = '';
          result.address_components.forEach((component) => {
            if (component.types.includes('locality')) city = component.long_name;
            if (component.types.includes('postal_code')) pinCode = component.long_name;
          });
          setAddress(formattedAddress);
          setCity(city);
          setPinCode(pinCode);
          onLocationSelect({ lat, lng, address: formattedAddress, city, pinCode });
        } else {
          toast.error('Unable to find address for this location');
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        toast.error('Failed to fetch address');
      }
    },
    [onLocationSelect]
  );

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        updateMarker(lat, lng);
        reverseGeocode(lat, lng);
        if (map) {
          map.panTo({ lat, lng });
        }
      }
    },
    [reverseGeocode, map, updateMarker]
  );

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        updateMarker(lat, lng);
        setAddress(place.formatted_address || '');
        let city = '';
        let pinCode = '';
        place.address_components?.forEach((component) => {
          if (component.types.includes('locality')) city = component.long_name;
          if (component.types.includes('postal_code')) pinCode = component.long_name;
        });
        setCity(city);
        setPinCode(pinCode);
        onLocationSelect({ lat, lng, address: place.formatted_address || '', city, pinCode });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      } else {
        toast.error('Please select a valid location from the suggestions');
      }
    }
  }, [onLocationSelect, map, updateMarker]);

  useEffect(() => {
    if (initialLat != null && initialLng != null && !markerPosition) {
      setMarkerPosition({ lat: initialLat, lng: initialLng });
      updateMarker(initialLat, initialLng);
      reverseGeocode(initialLat, initialLng);
    }
  }, [initialLat, initialLng, markerPosition, reverseGeocode, updateMarker]);

  useEffect(() => {
    if (markerPosition) {
      updateMarker(markerPosition.lat, markerPosition.lng);
    }
  }, [markerPosition, updateMarker]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Location</label>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <Input
            placeholder="Enter restaurant address"
            className="w-full"
            aria-label="Search restaurant address"
          />
        </Autocomplete>
        <p className="text-sm text-muted-foreground">
          Type an address or click on the map to select the restaurant&apos;s location.
        </p>
      </div>
      <div className="relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
        />
      </div>
      {address && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-sm font-medium">Selected Location:</p>
          <p className="text-sm">{address}</p>
          {city && <p className="text-sm">City: {city}</p>}
          {pinCode && <p className="text-sm">Pin Code: {pinCode}</p>}
          <p className="text-sm">Coordinates: {markerPosition?.lat.toFixed(6)}, {markerPosition?.lng.toFixed(6)}</p>
        </div>
      )}
      <Button
        variant="outline"
        onClick={() => {
          setMarkerPosition(null);
          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }
          setAddress('');
          setCity('');
          setPinCode('');
          onLocationSelect({ lat: 0, lng: 0, address: '', city: '', pinCode: '' });
        }}
      >
        Clear Location
      </Button>
    </div>
  );
}