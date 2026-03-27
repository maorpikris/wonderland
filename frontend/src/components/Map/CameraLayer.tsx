import { useEffect } from 'react';
import { useMap } from '../../contexts/MapContext';
import { useCameras } from '../../hooks/useCameras';
import type { GeoJSONSource } from 'maplibre-gl';

const CAMERA_SOURCE = 'camera-source';
const CAMERA_OUTER_LAYER = 'camera-outer-layer';
const CAMERA_FILL_LAYER = 'camera-fill-layer';
const CAMERA_INNER_LAYER = 'camera-inner-layer';
const CAMERA_LABEL_LAYER = 'camera-label-layer';

export const CameraLayer = () => {
  const map = useMap();
  const { data: cameras } = useCameras();

  useEffect(() => {
    if (!map) return;

    const syncState = () => {
      // 1. Ensure Style is loaded
      if (!map.isStyleLoaded()) {
        return;
      }

      // 2. Ensure Source & Layers exist
      if (!map.getSource(CAMERA_SOURCE)) {
        map.addSource(CAMERA_SOURCE, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addLayer({
          id: CAMERA_OUTER_LAYER,
          type: 'circle',
          source: CAMERA_SOURCE,
          paint: {
            'circle-radius': 10,
            'circle-color': '#808080',
          },
        });

        map.addLayer({
          id: CAMERA_FILL_LAYER,
          type: 'circle',
          source: CAMERA_SOURCE,
          paint: {
            'circle-radius': 8,
            'circle-color': [
              'match',
              ['get', 'availability'],
              'AVAILABLE',
              '#00FF00',
              '#FF0000',
            ],
          },
        });

        map.addLayer({
          id: CAMERA_INNER_LAYER,
          type: 'circle',
          source: CAMERA_SOURCE,
          paint: {
            'circle-radius': 3,
            'circle-color': '#808080',
          },
        });

        map.addLayer({
          id: CAMERA_LABEL_LAYER,
          type: 'symbol',
          source: CAMERA_SOURCE,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 18,
            'text-offset': [0, -1.8],
            'text-anchor': 'top',
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': '#FFFFFF',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
          },
        });
      }

      // 3. Update Data
      const source = map.getSource(CAMERA_SOURCE) as GeoJSONSource;
      if (source && cameras) {
        const features = cameras
          .filter((c) => c.position)
          .map((c) => ({
            type: 'Feature' as const,
            geometry: c.position!,
            properties: {
              id: c.id,
              name: c.name,
              availability: c.availability || 'AVAILABLE',
            },
          }));

        source.setData({
          type: 'FeatureCollection',
          features,
        });
      }
    };

    // Run setup immediately if possible
    syncState();

    // Listen to events that might require us to re-run the sync
    map.on('idle', syncState);
    map.on('styledata', syncState);

    return () => {
      map.off('idle', syncState);
      map.off('styledata', syncState);

      try {
        if (map.getStyle && map.getStyle()) {
          if (map.getLayer(CAMERA_LABEL_LAYER))
            map.removeLayer(CAMERA_LABEL_LAYER);
          if (map.getLayer(CAMERA_INNER_LAYER))
            map.removeLayer(CAMERA_INNER_LAYER);
          if (map.getLayer(CAMERA_FILL_LAYER))
            map.removeLayer(CAMERA_FILL_LAYER);
          if (map.getLayer(CAMERA_OUTER_LAYER))
            map.removeLayer(CAMERA_OUTER_LAYER);
          if (map.getSource(CAMERA_SOURCE)) map.removeSource(CAMERA_SOURCE);
        }
      } catch (e) {
        console.warn('CameraLayer cleanup omitted:', e);
      }
    };
  }, [map, cameras]);

  return null;
};
