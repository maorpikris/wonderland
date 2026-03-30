export function calculateFOV(
  normalizedZoom: number,
  sensorWidth: number = 4.8,
  minFocal: number = 4.7,
  maxOpticalFocal: number = 94.0,
  maxZoom: number = 30,
  maxNormalizedValue: number = 1,
  minNormalizedValue: number = -1,
): number {
  // 1. Clamp input to ensure it stays within -1 and 1
  const z = Math.max(
    minNormalizedValue,
    Math.min(maxNormalizedValue, normalizedZoom),
  );

  // 2. Map normalized range to a Total Magnification Factor of 1x...30x
  // Formula: target = minZoom + (inputZoom - minNormalizedInput) * (maxZoom - minZoom) / (maxNormalizedInput - minNormalizedInput)
  const totalMagnification =
    1 +
    ((z - minNormalizedValue) * (maxZoom - 1)) /
      (maxNormalizedValue - minNormalizedValue);

  const opticalLimit = maxOpticalFocal / minFocal; // 20x

  let currentFocal: number;
  let digitalFactor = 1.0;

  if (totalMagnification <= opticalLimit) {
    // Phase 1: Optical Zoom (1x to 20x)
    currentFocal = minFocal * totalMagnification;
  } else {
    // Phase 2: Digital Zoom (20x to 30x)
    currentFocal = maxOpticalFocal;
    digitalFactor = totalMagnification / opticalLimit;
  }

  // 3. FOV Formula: 2 * arctan( (sensorWidth / digitalFactor) / (2 * focalLength) )
  const hfovRad =
    2 * Math.atan(sensorWidth / digitalFactor / (2 * currentFocal));

  return (hfovRad * 180) / Math.PI;
}
