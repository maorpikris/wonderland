/**
 * Converts WGS84 (lon, lat) to UTM Zone 36N (Easting, Northing).
 * This is a simplified version suitable for Israel.
 */
export function wgs84ToUtm(lon: number, lat: number): { easting: number; northing: number } {
  const a = 6378137; // WGS84 semi-major axis
  const f = 1 / 298.257223563; // WGS84 flattening
  const k0 = 0.9996; // UTM scale factor
  const lon0 = 33 * (Math.PI / 180); // Central meridian for Zone 36

  const latRad = lat * (Math.PI / 180);
  const lonRad = lon * (Math.PI / 180);

  const e2 = 2 * f - f * f;
  const ep2 = e2 / (1 - e2);

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = ep2 * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lonRad - lon0);

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latRad -
    (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latRad) +
    (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latRad) -
    (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latRad)
  );

  const easting = k0 * N * (A + (1 - T + C) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ep2) * A * A * A * A * A / 120) + 500000;
  const northing = k0 * (M + N * Math.tan(latRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 + (61 - 58 * T + T * T + 600 * C - 330 * ep2) * A * A * A * A * A * A / 720));

  return { easting: Math.round(easting), northing: Math.round(northing) };
}

/**
 * Converts UTM Zone 36N (Easting, Northing) to WGS84 (lon, lat).
 */
export function utmToWgs84(easting: number, northing: number): { lon: number; lat: number } {
  const a = 6378137;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const lon0 = 33 * (Math.PI / 180);

  const e2 = 2 * f - f * f;
  const ep2 = e2 / (1 - e2);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const x = easting - 500000;
  const y = northing;

  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));

  const phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  const C1 = ep2 * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  const D = x / (N1 * k0);

  const latRad = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D * D * D * D * D * D / 720);
  const lonRad = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);

  return {
    lon: (lonRad + lon0) * (180 / Math.PI),
    lat: latRad * (180 / Math.PI)
  };
}
