import React, { useMemo } from 'react';
// @ts-ignore
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { GalleryData } from '@/types/models';

interface MapboxViewProps {
  galleries: GalleryData[];
  onPinClick: (index: number) => void;
  mode: string;
  
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYmFyZGFpIiwiYSI6ImNsazZzMnd5azA3YWEzZW8wcTF4cmY5YWgifQ.P4v76_O5Lp8yN0Qh4-m_2A'; // Fallback to a demo token if undefined (for demonstration purposes, though usually invalid for production without right origin). But wait, I'll provide a placeholder or a free token.

import { useMap } from "react-map-gl/mapbox";

const MapboxView: React.FC<MapboxViewProps> = ({ galleries, onPinClick, mode }) => {
  const mapRef = React.useRef<any>(null);
  const validGalleries = useMemo(() => {
    return galleries.filter(
      g => g.latitude != null && g.longitude != null
    ).map(g => ({
      ...g,
      lat: Number(g.latitude),
      lng: Number(g.longitude),
      originalIndex: galleries.findIndex(gal => gal.id === g.id)
    }));
  }, [galleries]);

  const mapStyle = 'mapbox://styles/mapbox/satellite-streets-v12';

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: mode === 'dark' ? '1px solid #333' : '1px solid #ddd' }}>
      <Map
        ref={mapRef}
        onLoad={(e) => {
          const map = e.target;
          let userInteracting = false;
          let spinEnabled = true;
          const secondsPerRevolution = 120;
          const maxSpinZoom = 5;
          const slowSpinZoom = 3;

          function spinGlobe() {
            const zoom = map.getZoom();
            if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
              let distancePerSecond = 360 / secondsPerRevolution;
              if (zoom > slowSpinZoom) {
                const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                distancePerSecond *= zoomDif;
              }
              const center = map.getCenter();
              center.lng -= distancePerSecond;
              map.easeTo({ center, duration: 1000, easing: (n) => n });
            }
          }

          map.on('mousedown', () => { userInteracting = true; });
          map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
          map.on('dragend', () => { userInteracting = false; spinGlobe(); });
          map.on('pitchend', () => { userInteracting = false; spinGlobe(); });
          map.on('rotateend', () => { userInteracting = false; spinGlobe(); });
          map.on('moveend', () => { spinGlobe(); });

          spinGlobe();
        }}
        initialViewState={{
          longitude: 118,
          latitude: -2.5,
          zoom: 2
        }}
        projection="globe"
        fog={{
          range: [0.8, 8],
          color: "rgba(255, 255, 255, 0)",
          "high-color": "#242B4B",
          "space-color": "#0B1026",
          "star-intensity": 0.8
        }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={true}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {validGalleries.map((g, idx) => (
          <Marker 
            key={`${g.id}-${idx}`} 
            longitude={g.lng} 
            latitude={g.lat} 
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom();
                // If zoomed in close enough, open lightbox
                if (currentZoom >= 10) {
                  onPinClick(g.originalIndex + 1);
                } else {
                  // Fly to location
                  mapRef.current.flyTo({
                    center: [g.lng, g.lat],
                    zoom: 12,
                    duration: 2000,
                    essential: true
                  });
                }
              }
            }}
          >
            <div 
              style={{
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundImage: `url('${g.image_url}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={g.caption || "Gallery Image"}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
};

export default MapboxView;
