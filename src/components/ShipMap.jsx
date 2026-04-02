import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ShipMarkers from './ShipMarkers';

export default function ShipMap({ ships }) {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[1.29, 103.85]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ShipMarkers ships={ships} />
      </MapContainer>
    </div>
  );
}