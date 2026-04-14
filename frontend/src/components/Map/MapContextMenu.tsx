import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createPortal } from 'react-dom';
import { Box, Button, Stack } from '@mantine/core';
import { MapPinSimpleArea } from '@phosphor-icons/react';
import { useMapContextMenu } from '../../stores/useMapContextMenu';
import { useSelfLocation } from '../../hooks/useSelfLocation';
import { useMap } from '../../contexts/MapContext';
import { mapContextMenuStyles } from './MapContextMenu.css';

interface MapContextMenuProps {
  onMarkSpot: () => void;
}

export const MapContextMenu = ({ onMarkSpot }: MapContextMenuProps) => {
  const map = useMap();
  const { isOpen, lngLat, closeMenu } = useMapContextMenu();
  const { updateLocation, isUpdating } = useSelfLocation();
  const [popupContainer, setPopupContainer] = useState<HTMLElement | null>(
    null,
  );
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (isOpen && lngLat) {
      if (!popupRef.current) {
        const div = document.createElement('div');
        setPopupContainer(div);

        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: true,
          maxWidth: '300px',
          className: mapContextMenuStyles.popup,
        })
          .setLngLat([lngLat.lng, lngLat.lat])
          .setDOMContent(div)
          .addTo(map);

        popupRef.current.on('close', closeMenu);
      } else {
        popupRef.current.setLngLat([lngLat.lng, lngLat.lat]);
        if (!popupRef.current.isOpen()) {
          popupRef.current.addTo(map);
        }
      }
    } else {
      if (popupRef.current && popupRef.current.isOpen()) {
        popupRef.current.remove();
      }
    }
  }, [map, isOpen, lngLat, closeMenu]);

  useEffect(() => {
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, []);

  if (!isOpen || !popupContainer) return null;

  const handleSetSelfLocation = () => {
    if (lngLat) {
      updateLocation({ lat: lngLat.lat, lng: lngLat.lng });
    }
    closeMenu();
  };

  const handleMarkSpot = () => {
    onMarkSpot();
    closeMenu();
  };

  return createPortal(
    <Box p={2}>
      <Stack gap={2}>
        <Button
          variant="subtle"
          fullWidth
          justify="flex-start"
          leftSection={<MapPinSimpleArea size={16} />}
          onClick={handleSetSelfLocation}
          loading={isUpdating}
          className={mapContextMenuStyles.button}
        >
          בחר כמיקום שלי
        </Button>
        <Button
          variant="subtle"
          fullWidth
          justify="flex-start"
          leftSection={<MapPinSimpleArea size={16} weight="fill" />}
          onClick={handleMarkSpot}
          className={mapContextMenuStyles.button}
        >
          דקור איתור
        </Button>
      </Stack>
    </Box>,
    popupContainer,
  );
};
