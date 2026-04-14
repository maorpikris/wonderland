# Cameras API Guide

This file documents the camera-related HTTP requests used by the frontend in [cameras.api.ts](./cameras.api.ts).

## Base URL

The frontend uses:

```ts
const backendUrl =
  import.meta.env.VITE_MAGENIM_BACKEND_URL || 'http://localhost:3000';
```

Use `VITE_MAGENIM_BACKEND_URL` when available, otherwise default to `http://localhost:3000`.

## Camera Response Shape

`GET /cameras` returns an array of camera objects with this shape:

```ts
type Camera = {
  id: string;
  name: string;
  type?: string;
  position?: {
    type: 'Point';
    coordinates: [number, number];
  };
  initialAzimuth?: number;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  hasThermal?: boolean;
  dayNightModeStrategy?: 'stream' | 'api' | 'none';
};
```

## Endpoints

### Get all cameras

```http
GET /cameras
```

Response:

```json
[
  {
    "id": "cam-1",
    "name": "North Gate",
    "availability": "AVAILABLE",
    "hasThermal": true
  }
]
```

### Move camera up

```http
POST /cameras/:id/move-up?isThermal=true&sensitivity=5
```

Optional query parameters:

- `isThermal=true`
- `sensitivity=<number>`

### Move camera down

```http
POST /cameras/:id/move-down?isThermal=true&sensitivity=5
```

Optional query parameters:

- `isThermal=true`
- `sensitivity=<number>`

### Rotate camera left

```http
POST /cameras/:id/rotate-left?isThermal=true&sensitivity=5
```

Optional query parameters:

- `isThermal=true`
- `sensitivity=<number>`

### Rotate camera right

```http
POST /cameras/:id/rotate-right?isThermal=true&sensitivity=5
```

Optional query parameters:

- `isThermal=true`
- `sensitivity=<number>`

### Zoom in

```http
POST /cameras/:id/zoom-in?isThermal=true
```

Optional query parameter:

- `isThermal=true`

### Zoom out

```http
POST /cameras/:id/zoom-out?isThermal=true
```

Optional query parameter:

- `isThermal=true`

### Focus in

```http
POST /cameras/:id/focus-in?isThermal=true
```

Optional query parameter:

- `isThermal=true`

### Focus out

```http
POST /cameras/:id/focus-out?isThermal=true
```

Optional query parameter:

- `isThermal=true`

### Set day/night mode

```http
POST /cameras/:id/day-night-mode
Content-Type: application/json
```

Request body:

```json
{
  "mode": "day"
}
```

Allowed values for `mode`:

- `"day"`
- `"night"`

### Update camera

```http
PATCH /cameras/:id
Content-Type: application/json
```

Request body accepts a partial camera object. Example:

```json
{
  "name": "North Gate Camera",
  "initialAzimuth": 180
}
```

### Get recordings

```http
GET /cameras/:id/recordings?start=2026-04-10T00:00:00Z&end=2026-04-10T23:59:59Z
```

Optional query parameters:

- `start=<string>`
- `end=<string>`

## Example Fetch Client

```js
const BASE_URL = 'http://localhost:3000';

export async function getCameras() {
  const response = await fetch(`${BASE_URL}/cameras`);
  if (!response.ok) throw new Error('Failed to fetch cameras');
  return response.json();
}

export async function moveUp(id, { isThermal, sensitivity } = {}) {
  const params = new URLSearchParams();

  if (isThermal) params.set('isThermal', 'true');
  if (sensitivity != null) params.set('sensitivity', String(sensitivity));

  const response = await fetch(`${BASE_URL}/cameras/${id}/move-up?${params}`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('Failed to move camera up');
  return response;
}

export async function setDayNightMode(id, mode) {
  const response = await fetch(`${BASE_URL}/cameras/${id}/day-night-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });

  if (!response.ok) throw new Error('Failed to set day/night mode');
  return response;
}
```

## Notes

- PTZ endpoints use `POST` with query parameters, not JSON bodies.
- In the current implementation, `sensitivity` is only sent when it is truthy. If another UI must support `0`, use `sensitivity != null` instead of a truthy check.
