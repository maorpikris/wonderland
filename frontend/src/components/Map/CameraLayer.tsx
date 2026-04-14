import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../../contexts/MapContext';
import { useCameras } from '../../hooks/useCameras';
import { useCameraUpdates } from '../../hooks/useCameraUpdates';
import { createSector } from '../../utils/geo';
import type { GeoJSONSource } from 'maplibre-gl';

const CAMERA_SOURCE = 'camera-source';
const CAMERA_OUTER_LAYER = 'camera-outer-layer';
const CAMERA_FILL_LAYER = 'camera-fill-layer';
const CAMERA_INNER_LAYER = 'camera-inner-layer';
const CAMERA_FOV_SOURCE = 'camera-fov-source';
const CAMERA_FOV_LAYER = 'camera-fov-layer';

export const CameraLayer = () => {
  const map = useMap();
  const { data: cameras } = useCameras();
  const cameraUpdates = useCameraUpdates();
  const labelMarkersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

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

  // 2. Data Updates (Sources & Markers)
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || !cameras) return;

    // Update GeoJSON sources
    const updateSources = () => {
      const source = map.getSource(CAMERA_SOURCE) as GeoJSONSource;
      const fovSource = map.getSource(CAMERA_FOV_SOURCE) as GeoJSONSource;

      if (source) {
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
        source.setData({ type: 'FeatureCollection', features });
      }

      if (fovSource) {
        const fovFeatures = cameras
          .filter(
            (c) =>
              c.position &&
              cameraUpdates[c.id] &&
              c.availability === 'AVAILABLE',
          )
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
        fovSource.setData({ type: 'FeatureCollection', features: fovFeatures });
      }
    };

    // Update HTML label markers
    const updateLabels = () => {
      const currentCameraIds = new Set(cameras.map((c) => String(c.id)));

      // Cleanup removed cameras
      Object.keys(labelMarkersRef.current).forEach((id) => {
        if (!currentCameraIds.has(id)) {
          labelMarkersRef.current[id].remove();
          delete labelMarkersRef.current[id];
        }
      });

      // Add/Update markers
      cameras.forEach((camera) => {
        if (!camera.position) return;
        const [lng, lat] = camera.position.coordinates;
        const id = String(camera.id);
        const isAvailable = (camera as any).availability === 'AVAILABLE';

        const getLabelStyle = () => ({
          background: isAvailable
            ? 'rgba(0, 120, 50, 0.75)'
            : 'rgba(180, 20, 20, 0.75)',
          border: isAvailable
            ? '1px solid rgba(100, 255, 100, 0.4)'
            : '1px solid rgba(255, 100, 100, 0.4)',
        });

        if (!labelMarkersRef.current[id]) {
          const el = document.createElement('div');
          el.innerText = camera.name;
          const style = getLabelStyle();
          el.style.background = style.background;
          el.style.border = style.border;
          el.style.color = 'white';
          el.style.padding = '2px 8px';
          el.style.borderRadius = '6px';
          el.style.fontSize = '12px';
          el.style.fontWeight = '700';
          el.style.whiteSpace = 'nowrap';
          el.style.pointerEvents = 'none';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
          el.style.position = 'absolute';
          el.style.top = '-40px';
          el.style.left = '50%';
          el.style.transform = 'translateX(-50%)';

          const container = document.createElement('div');
          container.appendChild(el);

          const marker = new maplibregl.Marker({ element: container })
            .setLngLat([lng, lat])
            .addTo(map);
          labelMarkersRef.current[id] = marker;
        } else {
          labelMarkersRef.current[id].setLngLat([lng, lat]);
          const el = labelMarkersRef.current[id].getElement()
            .firstChild as HTMLDivElement;
          if (el) {
            el.innerText = camera.name;
            const style = getLabelStyle();
            el.style.background = style.background;
            el.style.border = style.border;
          }
        }
      });
    };

    updateSources();
    updateLabels();

    return () => {
      // Intentionally not cleaning up labels here to avoid flicker on each update
      // Handled by the next effect run or component unmount
    };
  }, [map, cameras, cameraUpdates]);

  // Cleanup all markers on unmount
  useEffect(() => {
    return () => {
      Object.keys(labelMarkersRef.current).forEach((id) => {
        labelMarkersRef.current[id].remove();
      });
      labelMarkersRef.current = {};
    };
  }, []);

  return null;
};
