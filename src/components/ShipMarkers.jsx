// In charge of rendering ship details

import { Marker, Popup } from 'react-leaflet';

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