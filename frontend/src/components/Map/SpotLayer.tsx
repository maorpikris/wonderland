import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../../contexts/MapContext';
import { useSpots } from '../../hooks/useSpots';

interface SpotLayerProps {
  onSpotClick?: (spotId: number) => void;
}

export const SpotLayer = ({ onSpotClick }: SpotLayerProps) => {
  const map = useMap();
  const { data: spots } = useSpots();
  const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});

  useEffect(() => {
    if (!map || !spots) return;

    // Create a set of current spot IDs for easy lookup
    const currentSpotIds = new Set(spots.map((s) => s.id));

    // Remove markers for spots that no longer exist
    Object.keys(markersRef.current).forEach((id) => {
      const spotId = Number(id);
      if (!currentSpotIds.has(spotId)) {
        markersRef.current[spotId].remove();
        delete markersRef.current[spotId];
      }
    });

    // Add or update markers for existing spots
    spots.forEach((spot) => {
      if (!spot.position) return;

      const position =
        typeof spot.position === 'string'
          ? JSON.parse(spot.position)
          : spot.position;
      if (!position || !position.coordinates) return;

      const [lng, lat] = position.coordinates;

      if (!markersRef.current[spot.id]) {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'spot-marker';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = spot.color || '#228be6';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';
        el.style.cursor = 'pointer';

        // Add label
        const label = document.createElement('div');
        label.innerText = spot.name;
        label.style.position = 'absolute';
        label.style.top = '-30px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.background = 'rgba(20, 31, 50, 0.4)';
        label.style.color = 'white';
        label.style.padding = '2px 8px';
        label.style.borderRadius = '6px';
        label.style.fontSize = '12px';
        label.style.fontWeight = '700';
        label.style.whiteSpace = 'nowrap';
        label.style.fontWeight = 'bold';
        label.style.pointerEvents = 'none';
        label.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        label.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        el.appendChild(label);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);

        el.onclick = (e) => {
          e.stopPropagation();
          if (onSpotClick) onSpotClick(spot.id);
        };

        markersRef.current[spot.id] = marker;
      } else {
        // Update existing marker
        const marker = markersRef.current[spot.id];
        marker.setLngLat([lng, lat]);

        // Update styling/label if needed
        const el = marker.getElement();
        el.style.backgroundColor = spot.color || '#228be6';
        const label = el.querySelector('div');
        if (label) label.innerText = spot.name;
      }
    });
  }, [map, spots, onSpotClick]);

  useEffect(() => {
    return () => {
      // Cleanup all markers on unmount
      Object.keys(markersRef.current).forEach((id) => {
        markersRef.current[Number(id)].remove();
      });
      markersRef.current = {};
    };
  }, []);

  return null;
};
