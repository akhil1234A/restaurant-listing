"use client"

import { useEffect, useRef } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface RestaurantMapProps {
  latitude: number
  longitude: number
  name: string
}

export default function RestaurantMap({ latitude, longitude, name }: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    // Initialize map only if coordinates are valid
    if (!latitude || !longitude || !mapRef.current) return

    const initMap = async () => {
      // Load Google Maps API
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
      })

      try {
        await loader.load()
        const position = { lat: latitude, lng: longitude }

        // Create map instance
        const map = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        })

        mapInstanceRef.current = map

        // Add marker
        new google.maps.Marker({
          position,
          map,
          title: name,
          animation: google.maps.Animation.DROP,
        })
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      }
    }

    initMap()

    // Cleanup
    return () => {
      mapInstanceRef.current = null
    }
  }, [latitude, longitude, name])

  return <div ref={mapRef} className="h-full w-full" />
}
