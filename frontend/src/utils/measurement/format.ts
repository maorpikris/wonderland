export const formatMeasurementPreview = (meters: number): string => {
  if (!Number.isFinite(meters) || meters < 0) {
    return '0m';
  }

  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  const km = meters / 1000;
  const rounded = Math.round(km * 10) / 10;
  const kmStr = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  return `${kmStr}km`;
};

export const formatAzimuth = (degrees: number): string =>
  `${Math.round(degrees)}\u00B0`;

export const formatSegmentLabel = (
  meters: number,
  azimuthDeg: number,
): string => `${formatMeasurementPreview(meters)} ${formatAzimuth(azimuthDeg)}`;
