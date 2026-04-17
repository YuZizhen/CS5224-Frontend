import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function ShipMarkers({ ships }) {
  return (
    <>
      {ships.map((ship) => (
        <Marker key={ship.id} position={[ship.lat, ship.lng]}>
          <Popup>
            <div>
              <strong>{ship.name}</strong>
              <br />
              MMSI: {ship.id}
              <br />
              Type: {ship.vesselType}
              <br />
              Status: {ship.status}
              <br />
              Speed: {ship.speed} kn
              <br />
              Heading: {ship.heading}°
              <br />
              Lat: {ship.lat}
              <br />
              Lng: {ship.lng}
              <br />
              Updated: {ship.updatedAt || 'N/A'}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}