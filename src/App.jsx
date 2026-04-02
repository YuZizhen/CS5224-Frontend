import { useEffect, useState } from 'react';
import ShipMap from './components/ShipMap';
import { getMockShips } from './data/mockShips';

export default function App() {
  const [ships, setShips] = useState(getMockShips());

  useEffect(() => {
    const interval = setInterval(() => {
      setShips(getMockShips());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return <ShipMap ships={ships} />;
}