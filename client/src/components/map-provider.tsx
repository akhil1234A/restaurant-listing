'use client';

import { useJsApiLoader } from '@react-google-maps/api';
import { PropsWithChildren } from 'react';

const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

export default function MapProvider({ children }: PropsWithChildren) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    version: 'weekly', // Stable version for google.maps.Marker
  });

  if (loadError) {
    return <div className="flex h-[400px] w-full items-center justify-center text-red-500">Error loading map</div>;
  }

  if (!isLoaded) {
    return <div className="flex h-[400px] w-full items-center justify-center">Loading map...</div>;
  }

  return <>{children}</>;
}