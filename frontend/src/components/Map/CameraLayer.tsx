import { useEffect } from 'react';
import { useMap } from '../../contexts/MapContext';
import { useCameras } from '../../hooks/useCameras';
import { useCameraUpdates } from '../../hooks/useCameraUpdates';
import { createSector } from '../../utils/geo';
import type { GeoJSONSource } from 'maplibre-gl';

const CAMERA_SOURCE = 'camera-source';
const CAMERA_OUTER_LAYER = 'camera-outer-layer';
const CAMERA_FILL_LAYER = 'camera-fill-layer';
const CAMERA_INNER_LAYER = 'camera-inner-layer';
const CAMERA_LABEL_LAYER = 'camera-label-layer';
const CAMERA_FOV_SOURCE = 'camera-fov-source';
const CAMERA_FOV_LAYER = 'camera-fov-layer';

export const CameraLayer = () => {
  const map = useMap();
  const { data: cameras } = useCameras();
  const cameraUpdates = useCameraUpdates();

  // 1. Initial Source/Layer Setup
  useEffect(() => {
    if (!map) return;

    const setupLayers = () => {
      if (!map.isStyleLoaded()) return;

      if (!map.getSource(CAMERA_SOURCE)) {
        console.log('CameraLayer: Initializing sources and layers');
        map.addSource(CAMERA_SOURCE, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addSource(CAMERA_FOV_SOURCE, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addLayer({
          id: CAMERA_FOV_LAYER,
          type: 'fill',
          source: CAMERA_FOV_SOURCE,
          paint: {
            'fill-color': '#00FF00',
            'fill-opacity': 0.2,
            'fill-outline-color': '#00FF00',
          },
        });

        map.addLayer({
          id: CAMERA_OUTER_LAYER,
          type: 'circle',
          source: CAMERA_SOURCE,
          paint: {
            'circle-radius': 10,
            'circle-color': '#ffffffff',
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
            'circle-color': '#ffffffff',
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
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    }
    map.on('styledata', setupLayers);
    map.on('idle', setupLayers);

    return () => {
      map.off('styledata', setupLayers);
      map.off('idle', setupLayers);
      try {
        if (map.getStyle()) {
          [
            CAMERA_LABEL_LAYER,
            CAMERA_INNER_LAYER,
            CAMERA_FILL_LAYER,
            CAMERA_OUTER_LAYER,
            CAMERA_FOV_LAYER,
          ].forEach((id) => {
            if (map.getLayer(id)) map.removeLayer(id);
          });
          [CAMERA_SOURCE, CAMERA_FOV_SOURCE].forEach((sourceId) => {
            if (map.getSource(sourceId)) map.removeSource(sourceId);
          });
        }
      } catch (e) {
        console.warn('CameraLayer cleanup omitted:', e);
      }
    };
  }, [map]);

  // 2. Data Updates
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const updateData = () => {
      const source = map.getSource(CAMERA_SOURCE) as GeoJSONSource;
      const fovSource = map.getSource(CAMERA_FOV_SOURCE) as GeoJSONSource;

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

      if (fovSource && cameras) {
        const fovFeatures = cameras
          .filter((c) => c.position && cameraUpdates[c.id])
          .map((c) => {
            const update = cameraUpdates[c.id];
            return {
              type: 'Feature' as const,
              geometry: createSector(
                c.position!.coordinates,
                500,
                update.azimuth,
                update.fov,
              ),
              properties: { id: c.id },
            };
          });

        fovSource.setData({
          type: 'FeatureCollection',
          features: fovFeatures,
        });
      }
    };

    updateData();
  }, [map, cameras, cameraUpdates]);

  return null;
};
