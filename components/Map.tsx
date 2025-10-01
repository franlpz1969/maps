import React, { useEffect, useRef } from 'react';
import { Residence } from '../types';

// Leaflet is loaded from a CDN, so we declare it to TypeScript.
declare const L: any;

interface MapProps {
  residences: Residence[];
  favorites: Set<string>;
  contacted: Set<string>;
  onMarkerClick: (residence: Residence, position: { x: number; y: number }) => void;
  onMapClick: () => void;
  proximityCenter: [number, number] | null;
  proximityRadius: number; // in km
  activeRoute: { from: [number, number]; to: [number, number]; } | null;
}

// Helper to get a suitable zoom level for a given radius
const getZoomLevel = (radiusKm: number) => {
    if (radiusKm <= 1) return 15;
    if (radiusKm <= 2) return 14;
    if (radiusKm <= 5) return 13;
    if (radiusKm <= 10) return 12;
    if (radiusKm <= 25) return 11;
    return 10;
};

export const MapComponent: React.FC<MapProps> = ({ residences, favorites, contacted, onMarkerClick, onMapClick, proximityCenter, proximityRadius, activeRoute }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const circleLayer = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);

  // Initialize map instance once
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([40.416775, -3.703790], 9);
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      circleLayer.current = L.layerGroup().addTo(mapInstance.current);
      
      mapInstance.current.on('click', onMapClick);
    }
    
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', onMapClick);
      }
    };
  }, [onMapClick]);

  // Update markers when residences, favorites, or contacted change
  useEffect(() => {
    if (markersLayer.current) {
      markersLayer.current.clearLayers();

      residences.forEach(residence => {
        const isFavorite = favorites.has(residence.name);
        const isContacted = contacted.has(residence.name);
        
        let iconHtml;
        if (isFavorite) {
          iconHtml = `<div class="relative flex items-center justify-center w-4 h-4">
            <div class="absolute w-full h-full bg-yellow-400 rounded-full marker-pulse"></div>
            <div class="relative w-2 h-2 bg-yellow-600 rounded-full border-2 border-white"></div>
          </div>`;
        } else if (isContacted) {
          iconHtml = `<div class="relative flex items-center justify-center w-4 h-4">
            <div class="absolute w-full h-full bg-green-500 rounded-full marker-pulse"></div>
            <div class="relative w-2 h-2 bg-green-700 rounded-full border-2 border-white"></div>
          </div>`;
        }
        else {
          iconHtml = `<div class="relative flex items-center justify-center w-4 h-4">
            <div class="absolute w-full h-full bg-blue-500 rounded-full marker-pulse"></div>
            <div class="relative w-2 h-2 bg-blue-700 rounded-full border-2 border-white"></div>
          </div>`;
        }

        const customIcon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker(residence.coords, { icon: customIcon }).addTo(markersLayer.current);

        marker.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          onMarkerClick(residence, { x: e.originalEvent.clientX, y: e.originalEvent.clientY });
        });
      });
    }
  }, [residences, favorites, contacted, onMarkerClick]);
  
  // Effect to manage the proximity circle
  useEffect(() => {
    if (circleLayer.current && mapInstance.current) {
        circleLayer.current.clearLayers();
        if (proximityCenter) {
            const radiusInMeters = proximityRadius * 1000;
            L.circle(proximityCenter, {
                radius: radiusInMeters,
                color: '#3b82f6', // blue-500
                fillColor: '#60a5fa', // blue-400
                fillOpacity: 0.2,
                weight: 2
            }).addTo(circleLayer.current);

            // Adjust map view to the circle
            const zoomLevel = getZoomLevel(proximityRadius);
            mapInstance.current.flyTo(proximityCenter, zoomLevel);
        }
    }
  }, [proximityCenter, proximityRadius]);

  // Effect to manage the route display
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove previous route if it exists
    if (routingControlRef.current) {
        mapInstance.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
    }

    if (activeRoute) {
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(activeRoute.from[0], activeRoute.from[1]),
                L.latLng(activeRoute.to[0], activeRoute.to[1])
            ],
            show: false, // Hide the text instructions panel
            addWaypoints: false, // Don't allow adding new waypoints by clicking
            routeWhileDragging: false, // Don't re-route when dragging markers
            createMarker: () => null, // Don't show the default start/end markers
            lineOptions: {
                styles: [{ color: '#0284c7', opacity: 0.8, weight: 6 }] // sky-600
            }
        }).addTo(mapInstance.current);

        routingControlRef.current = routingControl;
    }
  }, [activeRoute]);

  return <div ref={mapRef} className="h-full w-full z-0" />;
};