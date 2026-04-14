# Wonderland UI Integration Guide

This guide maps the full project surface another UI would need in order to read data, control cameras, show live video, react to status updates, and work with spots, self-location, and recordings.

It is based on the current implementation in:

- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/camera/*`
- `backend/src/spot/*`
- `backend/src/self-location/*`
- `backend/src/playback/*`
- `frontend/src/api/*`
- `frontend/src/hooks/*`
- `frontend/src/components/WebRtcVideo/WebRtcVideo.tsx`
- `frontend/src/components/VideoGrid/VideoGrid.tsx`
- `frontend/src/components/ReplayVideo/ReplayModal.tsx`

## 1. Runtime Overview

There are three different integration channels in this project:

1. REST API on the backend Nest app, default `http://localhost:3000`
2. Socket.IO WebSocket events from the same backend, also default `http://localhost:3000`
3. Live video from MediaMTX over WHEP/WebRTC, currently used through `http://127.0.0.1:8889/<streamName>/whep`

In addition, the backend serves static files:

- `/static/...` from `backend/public`
- `/recordings/...` from the repository `recordings` folder

That means a second UI usually needs:

- one HTTP client for the backend
- one Socket.IO client for camera live updates
- one video player flow for WHEP/WebRTC
- optional direct playback/download access to `/recordings/...`

## 2. Base URLs and Environment Assumptions

### Backend API

The frontend camera and self-location clients use:

```ts
import.meta.env.VITE_MAGENIM_BACKEND_URL || 'http://localhost:3000'
```

The shared axios instance in another part of the frontend uses:

```ts
baseURL: 'http://localhost:3000'
```

So the effective backend default is:

- `http://localhost:3000`

### Live Video

The current frontend hardcodes MediaMTX WHEP URLs like:

```txt
http://127.0.0.1:8889/<stream-name>
```

Then the WebRTC component appends `/whep`.

Example final request target:

```txt
http://127.0.0.1:8889/12_high/whep
```

### Swagger

Swagger is exposed at:

- `http://localhost:3000/swagger`

This is useful for quick testing, but this guide includes details not obvious from Swagger, such as stream naming and frontend behavior.

## 3. Global Backend Behavior

The backend enables:

- CORS for all origins
- Nest global `ValidationPipe`
- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`

Important nuance:

- DTO-validated routes such as `spots` are strict about extra body fields.
- Some routes use plain objects or `any`, so they do not get the same strict DTO validation.

## 4. Data Models Another UI Should Know

### Camera object returned by `GET /cameras`

The frontend expects this shape:

```ts
type Camera = {
  id: string;
  name: string;
  type?: 'SIMPLE_PTZ' | 'THERMAL_PTZ';
  position?: {
    type: 'Point';
    coordinates: [number, number] | [number, number, number];
  };
  initialAzimuth?: number;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  hasThermal?: boolean;
  dayNightModeStrategy?: 'stream' | 'api' | 'none';
}
```

Important notes:

- `id` is returned as a string in the API response, even though it is numeric in the database.
- `availability` is not stored in the database. It is computed from MediaMTX path readiness.
- `hasThermal` is derived from the camera implementation, not from DB data.
- `dayNightModeStrategy` controls how the UI should switch day/thermal mode.

### Spot object

```ts
type Spot = {
  id: number;
  name: string;
  color: string;
  position: {
    type: 'Point';
    coordinates: [number, number] | [number, number, number];
  };
}
```

### Self-location object

```ts
type SelfLocation = {
  lat: number;
  lng: number;
}
```

### Recording segment object

Used by `/recordings/list`:

```ts
type Recording = {
  start: string;      // ISO timestamp
  duration: number;   // seconds
  url: string;        // direct downloadable/playable file URL
  quality?: 'high' | 'low';
  isThermal?: boolean;
}
```

The endpoint returns:

```ts
type GroupedRecordings = Record<string, Recording[]>;
```

where each key is the UTC start of an hour, for example:

```txt
2026-04-13T08:00:00.000Z
```

## 5. REST Endpoints

## 5.1 Cameras

Base route:

- `/cameras`

### `GET /cameras`

Purpose:

- fetch the list of all registered cameras with UI-relevant metadata

Response:

```json
[
  {
    "id": "1",
    "name": "camera_1",
    "type": "THERMAL_PTZ",
    "availability": "AVAILABLE",
    "initialAzimuth": 180,
    "position": {
      "type": "Point",
      "coordinates": [34.78, 32.08]
    },
    "hasThermal": true,
    "dayNightModeStrategy": "stream"
  }
]
```

Behavior details:

- this is the main discovery endpoint for another UI
- camera names and optional metadata come from the database
- camera runtime capabilities come from `cameras.json` and the camera model layer
- availability may initially be `UNAVAILABLE` until MediaMTX readiness checks run

Recommended UI use:

- call this once on initial load
- refresh it occasionally or update it via WebSocket status events
- use it as the source of truth for:
  - camera list
  - display names
  - whether thermal controls should exist
  - whether day/night switching should change stream path or call an API

### `GET /cameras/ids`

Purpose:

- fetch only camera IDs

Response:

```json
["1", "2", "3"]
```

Recommended UI use:

- optional
- most UIs can ignore this and just use `GET /cameras`

### `GET /cameras/:id/position`

Purpose:

- get current position of a camera

Current behavior:

- this endpoint currently returns mocked random coordinates near a fixed area
- it is not actual camera telemetry

Example response:

```json
{
  "type": "Point",
  "coordinates": [34.7891, 32.0888, 10]
}
```

Recommendation:

- do not rely on this endpoint for real control or tracking logic
- use it only if you explicitly want the current mocked behavior

### `POST /cameras/:id/move-up`

Purpose:

- tilt camera up

Query parameters:

- `isThermal=true` optional
- `sensitivity=<number>` optional

Example:

```http
POST /cameras/1/move-up?isThermal=true&sensitivity=0.5
```

Response:

```json
{ "success": true }
```

Behavior details:

- internally sends ONVIF continuous move with `pan=0`, `tilt=1`, `zoom=0`
- if `sensitivity` is omitted, backend defaults it to `1.0`
- movement is auto-stopped after about `500ms`
- the existing frontend repeats the request every `200ms` while the control is held down

Recommended UI use:

- call repeatedly while a control is pressed
- stop sending when the button is released
- use a repeat interval around `150ms` to `250ms`

### `POST /cameras/:id/move-down`

Same pattern as `move-up`, but tilt direction is reversed.

Example:

```http
POST /cameras/1/move-down?sensitivity=0.7
```

### `POST /cameras/:id/rotate-left`

Purpose:

- pan camera left

Example:

```http
POST /cameras/1/rotate-left?sensitivity=0.4
```

Behavior details:

- internally sends `pan=-1`, `tilt=0`, `zoom=0`
- thermal lens can be targeted using `isThermal=true`

### `POST /cameras/:id/rotate-right`

Purpose:

- pan camera right

Example:

```http
POST /cameras/1/rotate-right?sensitivity=0.4
```

Behavior details:

- internally sends `pan=1`, `tilt=0`, `zoom=0`

### `POST /cameras/:id/zoom-in`

Purpose:

- zoom in

Query parameters:

- `isThermal=true` optional

Example:

```http
POST /cameras/1/zoom-in?isThermal=true
```

Behavior details:

- no `sensitivity` parameter is used here by the current frontend
- move auto-stops after about `500ms`
- the frontend repeats the request while pressed

### `POST /cameras/:id/zoom-out`

Purpose:

- zoom out

Example:

```http
POST /cameras/1/zoom-out
```

### `POST /cameras/:id/focus-in`

Purpose:

- focus in

Query parameters:

- `isThermal=true` optional

Example:

```http
POST /cameras/1/focus-in
```

Behavior details:

- this uses ONVIF imaging focus, not PTZ move
- focus auto-stops after about `200ms`
- the frontend still repeats the request while the button is held

### `POST /cameras/:id/focus-out`

Purpose:

- focus out

Example:

```http
POST /cameras/1/focus-out?isThermal=true
```

### `POST /cameras/:id/day-night-mode`

Purpose:

- request a camera to switch day/night mode

Request body:

```json
{
  "mode": "day"
}
```

Allowed values:

- `"day"`
- `"night"`

Response:

```json
{ "success": true }
```

Important behavior detail:

- only cameras with `dayNightModeStrategy === 'api'` should use this as the main toggle action
- in the current codebase, `SimplePtzCamera` uses this strategy
- `ThermalPtzCamera` uses `dayNightModeStrategy === 'stream'`, so the UI changes stream source instead of calling this endpoint

Device-specific note:

- for `SimplePtzCamera`, backend code intentionally inverts the requested mode when calling the device CGI, because the device behavior is reversed
- the API contract remains normal for the UI
- UI should still send `"day"` when it wants day mode, and `"night"` when it wants night mode

### `PATCH /cameras/:id`

Purpose:

- update camera metadata stored in the database

Request body:

```json
{
  "name": "North Gate Camera",
  "initialAzimuth": 180,
  "position": {
    "type": "Point",
    "coordinates": [34.7818, 32.0853]
  }
}
```

Known persisted fields from the entity:

- `name`
- `ip`
- `type`
- `username`
- `password`
- `onvifPort`
- `initialAzimuth`
- `position`

Response:

- the saved camera entity object

Important caution:

- this route takes `@Body() updateData: any`
- there is no DTO-level whitelist for patch fields here
- another UI should only send fields it truly means to update
- for normal UI work, the most useful editable fields are usually `name`, `initialAzimuth`, and `position`

### Endpoint mismatch to know about

The frontend file `frontend/src/api/cameras.api.ts` contains a helper for:

- `GET /cameras/:id/recordings`

But `camera.controller.ts` does not expose that route.

There is a service method `CameraService.getRecordings(...)`, but no active controller endpoint is wired to it.

Recommendation:

- do not implement a new UI against `/cameras/:id/recordings` unless you first add the missing controller route
- use `/recordings/list` instead, which is currently exposed

## 5.2 Recordings

Base route:

- `/recordings`

### `GET /recordings/list`

Purpose:

- list recorded video files for one camera and one date

Query parameters:

- `cameraId=<string>` required
- `date=YYYY-MM-DD` required

Example:

```http
GET /recordings/list?cameraId=1&date=2026-04-13
```

Response shape:

```json
{
  "2026-04-13T08:00:00.000Z": [
    {
      "start": "2026-04-13T08:14:02.123Z",
      "duration": 598,
      "url": "http://localhost:3000/recordings/1_high/2026-04-13_08-14-02-123456.mp4",
      "quality": "high",
      "isThermal": false
    }
  ],
  "2026-04-13T09:00:00.000Z": [
    {
      "start": "2026-04-13T09:00:01.000Z",
      "duration": 600,
      "url": "http://localhost:3000/recordings/thermal_1_low/2026-04-13_09-00-01-000000.mp4",
      "quality": "low",
      "isThermal": true
    }
  ]
}
```

Behavior details:

- it scans the local `recordings` directory
- it returns segments from:
  - `<id>_high`
  - `<id>_low`
  - `thermal_<id>_high`
  - `thermal_<id>_low`
- thermal paths may produce no results for non-thermal cameras
- entries are grouped by UTC hour for UI convenience
- `url` values are directly playable and downloadable

Recommended UI use:

- fetch by camera and selected date
- flatten the object if your UI wants a single sorted list
- use `quality` and `isThermal` for filtering badges
- you can download files directly from the `url`

### Playback gap-filling logic exists in service, but is not exposed as a route

`PlaybackService.getPlayback(...)` can merge high-res and low-res segments into one playlist for a requested time range, but there is currently no controller endpoint exposing that method.

Recommendation:

- another UI should not assume a ready-made playlist endpoint exists
- if you need merged playback windows, you would need to add a controller route for it

## 5.3 Self Location

Base route:

- `/self-location`

### `GET /self-location`

Purpose:

- fetch the current self marker or operator location

Response:

```json
{
  "lat": 32.0853,
  "lng": 34.7818
}
```

Possible response:

- object with `lat` and `lng`
- `null`, depending on service state

### `POST /self-location`

Purpose:

- update the current self location

Request body:

```json
{
  "lat": 32.0853,
  "lng": 34.7818
}
```

Response:

```json
{ "success": true }
```

Important note:

- this route uses a plain inline body type, not a validated DTO
- send only numeric `lat` and `lng`

## 5.4 Spots

Base route:

- `/spots`

### `GET /spots`

Purpose:

- fetch all user-defined map spots

Response:

```json
[
  {
    "id": 3,
    "name": "Checkpoint A",
    "color": "#ff0000",
    "position": {
      "type": "Point",
      "coordinates": [34.7818, 32.0853]
    }
  }
]
```

### `POST /spots`

Purpose:

- create a new map spot

Request body:

```json
{
  "name": "Checkpoint A",
  "color": "#ff0000",
  "position": {
    "type": "Point",
    "coordinates": [34.7818, 32.0853]
  }
}
```

Response:

- created spot object

Validation:

- `name` required string
- `color` required string
- `position` required object
- unknown extra fields are rejected by the global validation pipe

### `PATCH /spots/:id`

Purpose:

- update part of a spot

Request body example:

```json
{
  "name": "Checkpoint A2",
  "color": "#00ff00"
}
```

Response:

- updated spot object

Validation:

- supports partial updates
- unknown extra fields are rejected

### `DELETE /spots/:id`

Purpose:

- remove a spot

Response:

- no body is required by the frontend

## 6. WebSocket Events

The backend exposes a Socket.IO gateway with open CORS.

Connection target used by the frontend:

- `http://localhost:3000`

### Event: `cameraUpdate`

Payload:

```json
{
  "id": "1",
  "azimuth": 214.3,
  "fov": 38.2
}
```

Meaning:

- `azimuth` is the current derived orientation in degrees
- `fov` is the current field of view derived from zoom level

How it is produced:

- backend polls ONVIF status every `2s`
- pan status is converted into an azimuth using `initialAzimuth`
- zoom status is converted into an estimated FOV

Recommended UI use:

- rotate camera icons or cones on a map
- update live camera overlays
- treat the data as periodic telemetry, not an authoritative historical state store

### Event: `cameraStatusUpdate`

Payload:

```json
{
  "id": "1",
  "availability": "AVAILABLE"
}
```

Meaning:

- camera low-res stream path became ready or not ready in MediaMTX

How it is produced:

- backend checks MediaMTX paths every `5s`
- compares the low-res path readiness with previous status
- emits only on changes

Recommended UI use:

- update availability badges live
- keep the last fetched camera list in sync without full refetch

## 7. Live Video Integration

This is the part another UI is most likely to miss if it only looks at REST routes.

## 7.1 Stream name rules

MediaMTX paths are registered automatically for each camera at startup.

For every camera:

- `<id>_high`
- `<id>_low`

For thermal-capable cameras:

- `thermal_<id>_high`
- `thermal_<id>_low`

Examples:

- `1_high`
- `1_low`
- `thermal_1_high`
- `thermal_1_low`

## 7.2 How the current UI chooses stream names

The current `VideoGrid` builds stream URLs as:

```txt
http://127.0.0.1:8889/${prefix}${camera.id}_${quality}
```

Where:

- `prefix` is `thermal_` only when:
  - the selected camera has `dayNightModeStrategy === 'stream'`
  - and the slot is currently toggled to thermal mode
- `quality` is `high` or `low`

Practical implication:

- for `stream` strategy cameras, thermal/day is implemented by switching stream path
- for `api` strategy cameras, thermal/day is implemented by calling `POST /cameras/:id/day-night-mode`
- for `api` strategy cameras, the stream path itself does not change during mode toggle

## 7.3 WHEP request flow

The current WebRTC component converts a stream base URL to:

```txt
<stream-url>/whep
```

Then it:

1. creates an RTCPeerConnection
2. creates an SDP offer
3. waits for ICE gathering to complete
4. `POST`s the SDP offer to the WHEP URL with `Content-Type: application/sdp`
5. receives answer SDP as plain text
6. sets remote description
7. starts playback when tracks arrive

If you are building another UI in React, Vue, Angular, or plain JS, you can reuse that exact handshake pattern.

## 7.4 Recommended video behavior for another UI

- default to low-res streams for small thumbnails
- use high-res for the focused or full-screen camera
- expose a thermal toggle only when `hasThermal === true`
- if `dayNightModeStrategy === 'stream'`, switch between normal and thermal stream names
- if `dayNightModeStrategy === 'api'`, call the day/night API and keep the same stream path
- show loading/error state because WHEP connections can fail or time out

## 8. Existing Frontend Integration Points

If the goal is to build another UI that behaves similarly, these are the main current integration points.

### Current frontend API wrappers

- `frontend/src/api/cameras.api.ts`
- `frontend/src/api/spot.api.ts`
- `frontend/src/api/selfLocation.api.ts`
- `frontend/src/api/axios.ts`

### Current frontend query/mutation hooks

- `frontend/src/hooks/useCameras.ts`
- `frontend/src/hooks/useSpots.ts`
- `frontend/src/hooks/useSelfLocation.ts`
- `frontend/src/hooks/useCameraUpdates.ts`

### Current frontend control behavior

`frontend/src/components/MeansActionBar/components/PTZControl/PTZControl.tsx`

Important UI behavior there:

- sensitivity slider is `1..10`
- value is converted to `0.1..1.0` for pan/tilt requests by dividing by `10`
- zoom/focus ignore sensitivity
- controls call the action immediately on mouse down
- controls repeat every `200ms` while held
- releasing the mouse only stops the frontend repeat loop; backend stop is automatic after short timeouts

### Current frontend thermal toggle behavior

`frontend/src/components/MeansActionBar/components/ThermalMeansButton.tsx`

Behavior:

- if camera strategy is `api`, the UI calls `/cameras/:id/day-night-mode`
- after that, it toggles local UI state
- if camera strategy is `stream`, it only toggles local state and stream path

### Current frontend recordings behavior

`frontend/src/components/ReplayVideo/ReplayModal.tsx`

Behavior:

- fetches `/recordings/list?cameraId=<id>&date=<YYYY-MM-DD>`
- groups by hour as returned
- filters by `quality`
- downloads segment URLs directly
- plays selected `url` in a plain `<video>` element

## 9. Integration Recommendations for Another UI

If you want the second UI to be dependable, this is the safest flow.

### Initial load

1. call `GET /cameras`
2. call `GET /spots`
3. call `GET /self-location`
4. open Socket.IO connection for camera events

### Rendering camera controls

For each camera:

- show availability from `GET /cameras`
- keep availability updated from `cameraStatusUpdate`
- show PTZ controls for all PTZ-capable cameras in this system
- show thermal toggle only if `hasThermal === true`
- branch thermal handling by `dayNightModeStrategy`

### Handling live stream choice

For each view slot:

- use low-res by default for grids
- use high-res for the active camera
- for stream-based thermal cameras, switch path prefix between normal and `thermal_`

### Handling PTZ

- treat PTZ as repeated momentary commands, not long-lived sessions
- pan/tilt actions should repeat while held
- use sensitivity in the range `0.1` to `1.0`
- zoom/focus should also repeat while held if you want parity with the current UI

### Handling recordings

- use `/recordings/list`
- request one day at a time
- display grouped or flattened segments
- stream/download returned `url` directly

## 10. Important Gotchas and Risks

These are the parts most likely to cause problems if a second UI assumes too much.

### Route that looks available in frontend but is not exposed in backend controller

- `GET /cameras/:id/recordings`

Current status:

- frontend helper exists
- backend service method exists
- controller route does not exist

### Mock position endpoint

- `GET /cameras/:id/position` returns random mocked data
- it should not be used for real map accuracy

### Camera patch route is broad

- `PATCH /cameras/:id` accepts a very open body
- another UI should send only intended metadata fields

### Sensitivity edge case in current frontend helper

The current frontend camera client only includes `sensitivity` when it is truthy.

That means:

- `0` would not be sent

Safer implementation for another UI:

```ts
if (sensitivity != null) {
  params.set('sensitivity', String(sensitivity));
}
```

### WebSocket base URL is hardcoded in current frontend

Current code uses:

- `io('http://localhost:3000')`

A new UI should make this configurable instead of hardcoding it.

### Live stream base URL is hardcoded in current frontend

Current code uses:

- `http://127.0.0.1:8889`

A new UI should make this configurable too.

### Recording URLs depend on backend static serving

Playback/download works because the backend serves:

- `/recordings/...`

If you deploy the UI and backend on different hosts, make sure:

- returned `url` values are reachable by the browser
- CORS and hostnames are correct

## 11. Minimal Reference Client Examples

### Fetch cameras

```js
async function getCameras(baseUrl) {
  const res = await fetch(`${baseUrl}/cameras`);
  if (!res.ok) throw new Error(`Failed to fetch cameras: ${res.status}`);
  return res.json();
}
```

### PTZ move with repeat

```js
function startPtzRepeat(fn, intervalMs = 200) {
  fn();
  const id = setInterval(fn, intervalMs);
  return () => clearInterval(id);
}

async function rotateRight(baseUrl, cameraId, { isThermal, sensitivity } = {}) {
  const params = new URLSearchParams();
  if (isThermal) params.set('isThermal', 'true');
  if (sensitivity != null) params.set('sensitivity', String(sensitivity));

  const query = params.toString();
  const res = await fetch(
    `${baseUrl}/cameras/${cameraId}/rotate-right${query ? `?${query}` : ''}`,
    { method: 'POST' },
  );

  if (!res.ok) throw new Error(`PTZ failed: ${res.status}`);
  return res.json();
}
```

### Day/night mode

```js
async function setDayNightMode(baseUrl, cameraId, mode) {
  const res = await fetch(`${baseUrl}/cameras/${cameraId}/day-night-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });

  if (!res.ok) throw new Error(`Failed to switch mode: ${res.status}`);
  return res.json();
}
```

### Recordings list

```js
async function getRecordingsList(baseUrl, cameraId, date) {
  const params = new URLSearchParams({ cameraId, date });
  const res = await fetch(`${baseUrl}/recordings/list?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load recordings: ${res.status}`);
  return res.json();
}
```

## 12. Best Practical Checklist

If another team is implementing a new UI, this is the safest checklist to follow:

1. Make backend API base URL configurable.
2. Make Socket.IO base URL configurable.
3. Make MediaMTX/WHEP base URL configurable.
4. Use `GET /cameras` as the main discovery endpoint.
5. Use `hasThermal` and `dayNightModeStrategy` to decide thermal behavior.
6. Use Socket.IO `cameraStatusUpdate` and `cameraUpdate` for live state.
7. Use repeated `POST` requests for PTZ while a control is held.
8. Use `/recordings/list` for recordings, not `/cameras/:id/recordings`.
9. Do not rely on `GET /cameras/:id/position` for real positioning.
10. Send only intentional fields to `PATCH /cameras/:id`.

## 13. Suggested Next Step

If you want a truly low-friction handoff for another UI team, the next best improvement would be to generate one real shared API contract file, for example:

- OpenAPI spec
- Postman collection
- typed frontend SDK

Right now the project behavior is clear enough to integrate with, but some important pieces live in code conventions rather than one formal contract, especially:

- live stream naming
- thermal strategy rules
- Socket.IO events
- the missing `/cameras/:id/recordings` route
