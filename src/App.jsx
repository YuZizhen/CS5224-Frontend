import { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import ShipMap from './components/ShipMap';
import { fetchLiveVessels } from './services/api';

function AppContent() {
  const [ships, setShips] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadShips = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          throw new Error('No auth token found');
        }

        const vesselData = await fetchLiveVessels(token);

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

export default function App() {
  return (
    <Authenticator>
      <AppContent />
    </Authenticator>
  );
}