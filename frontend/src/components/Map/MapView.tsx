import { Box } from '@mantine/core';
import maplibregl, { Map } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { MapProvider } from '../../contexts/MapContext';
import { mapViewStyles } from '@components/MapView.css';
import { MapControls } from '@components/map/controls';
import { MeasurementPanel } from '@components/map/controls/MeasurementPanel';
import { MapToolsOverlay } from '../mapTools/MapToolsOverlay';
import { subscribeMapResizeToContainer } from '../../utils/mapViewResize';
import { useMapClickStore } from '../../stores/useMapClick';
import { CameraLayer } from './CameraLayer';

if (maplibregl.getRTLTextPluginStatus() === 'unavailable') {
  maplibregl.setRTLTextPlugin('/mapbox-gl-rtl-text.min.js', true);
}

const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          mapproxy: {
            type: 'raster',
            tiles: [
              'http://localhost:8081/mapproxy/wmts/ortophoto/webmercator/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
          },
        },
        layers: [{ id: 'mapproxy-layer', type: 'raster', source: 'mapproxy' }],
      },
      center: [34.7818, 32.0853],
      zoom: 7,
    });

    map.on('click', (e) => {
      useMapClickStore.getState().triggerCallback(e.lngLat.lng, e.lngLat.lat);
    });

    mapRef.current = map;
    setMap(map);

    const stopSyncingMapSize = subscribeMapResizeToContainer(mapContainer, map);

    return () => {
      stopSyncingMapSize();
      map.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  return (
    <MapProvider value={map}>
      <div className={mapViewStyles.wrapper}>
        <Box ref={mapContainerRef} className={mapViewStyles.mapContainer}>
          <MapControls />
          <MeasurementPanel />
          <MapToolsOverlay />
          <CameraLayer />
        </Box>
      </div>
    </MapProvider>
  );
};

export default MapView;
