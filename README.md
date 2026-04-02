# CS5224 Frontend - Vessel Live Map

Frontend for live vessel map visualization using **React + Vite + Leaflet**.

This project currently supports:
- Interactive map display
- Vessel marker rendering
- Polling every 10 seconds
- Mock API integration using `json-server`
- Data transformation layer for easier migration to real backend APIs later

---

## Tech Stack

- React
- Vite
- Leaflet
- React Leaflet
- json-server (for mock API)

---

## Project Structure

```txt
src/
  components/
    ShipMap.jsx
    ShipMarkers.jsx
  services/
    api.js
    transform.js
  App.jsx

mock-data.json
```

---

## How to Run the Frontend

### 1. Install dependencies

```bash
npm install
```

### 2. Start the frontend

```bash
npm run dev
```

After starting, open the local Vite URL shown in the terminal, usually:

```txt
http://localhost:5173
```

---

## How to Run the Mock Backend

This project uses `json-server` to simulate backend API responses.

### 1. Install json-server

```bash
npm install -g json-server
```

### 2. Start the mock server

```bash
json-server --watch mock-data.json --port 8080
```

The mock API will run at:

```txt
http://localhost:8080
```

---

## Mock API Endpoint

Current mock endpoint:

```txt
GET http://localhost:8080/api_live_vessels
```

This corresponds to the frontend polling logic in `src/services/api.js`.

---

## Current Frontend Behavior

- Loads vessel data from mock API
- Polls every 10 seconds
- Converts backend response into frontend-friendly vessel objects
- Renders vessels as markers on the map
- Shows vessel info in popup

---

## Data Format

The frontend currently expects mock data in this shape:

```json
{
  "api_live_vessels": {
    "timestamp": "2026-04-02T12:00:00Z",
    "count": 1,
    "vessels": [
      {
        "mmsi": "671226100",
        "vessel_name": "RELIANCE II",
        "vessel_type": "cargo",
        "lat": 1.191,
        "lng": 103.6579,
        "sog": 0.3,
        "cog": 243.6,
        "heading": 321,
        "status": "anchored",
        "updated_at": "2026-03-19T14:29:55Z"
      }
    ]
  }
}
```

---

## Important Files

### `src/services/api.js`
Handles:
- API base URL
- Mock vs real API switching
- Request headers
- Fetch logic

### `src/services/transform.js`
Handles:
- Mapping backend vessel fields into frontend display format

Example transformed fields:
- `mmsi` -> `id`
- `vessel_name` -> `name`
- `sog` -> `speed`
- `updated_at` -> `updatedAt`

This makes it easier to change backend formats later without rewriting map components.

---

## When the Real API Is Ready

When the real backend is available, the main changes will likely be in:

### 1. `src/services/api.js`

Change:
- `baseUrl`
- endpoint path
- authorization token handling

Example:

```js
const USE_MOCK = false;
```

Update real config:

```js
real: {
  baseUrl: 'https://your-api-gateway-url.execute-api.ap-southeast-1.amazonaws.com/prod',
  liveVesselsPath: '/api/live/vessels',
  token: 'YOUR_REAL_TOKEN_HERE',
}
```

---

### 2. Add Authorization Header

If the real backend requires JWT / API token:

```js
headers.Authorization = `Bearer ${config.token}`;
```

If the backend later uses a custom API key header instead, it may become something like:

```js
headers['x-api-key'] = config.token;
```

So most likely, only the request header logic in `api.js` needs to change.

---

### 3. `src/services/transform.js`

If the real backend response fields are slightly different, update the field mapping here.

For example, if backend changes:
- `vessel_name` to `name`
- `mmsi` to `vessel_id`

then only `transform.js` needs to be updated.

---

## Expected Real API Migration Changes

When switching from mock to real backend, likely changes are:

- Mock URL:
  ```txt
  /api_live_vessels
  ```

- Real URL:
  ```txt
  /api/live/vessels
  ```

- Add auth header
- Possibly adjust response field mapping in `transform.js`

The map rendering components should require little or no change.

---

## Notes

- Polling interval is currently set to **10 seconds**
- Map markers are rendered from transformed vessel data
- Current implementation is designed to make future backend integration easier

---

## Future Improvements

Possible next steps:
- Smooth vessel movement animation
- Heatmap overlay
- Vessel track polyline rendering
- Filter by vessel type
- Bounding box filtering based on map viewport
