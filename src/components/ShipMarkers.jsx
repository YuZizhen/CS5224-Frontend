import { Marker, Popup } from 'react-leaflet';

export default function ShipMarkers({ ships }) {
  return (
    <>
      {ships.map((ship) => (
        <Marker key={ship.id} position={[ship.lat, ship.lng]}>
          <Popup>{ship.name}</Popup>
        </Marker>
      ))}
    </>
  );
}