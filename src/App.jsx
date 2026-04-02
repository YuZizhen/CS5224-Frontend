import { useEffect, useState } from 'react';
import ShipMap from './components/ShipMap';
import { fetchLiveVessels } from './services/api';

export default function App() {
  const [ships, setShips] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadShips = async () => {
      try {
        const vesselData = await fetchLiveVessels();

        if (!isMounted) return;

        setShips(vesselData);
        setError('');
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Failed to fetch vessels:', err);

        if (!isMounted) return;
        setError('Unable to load vessel data.');
      }
    };

    loadShips();
    const interval = setInterval(loadShips, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div
        style={{
          padding: '10px',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <strong>Live Vessel Map</strong>
        <div>Vessels: {ships.length}</div>
        <div>Last Updated: {lastUpdated || 'Loading...'}</div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>

      <ShipMap ships={ships} />
    </>
  );
}