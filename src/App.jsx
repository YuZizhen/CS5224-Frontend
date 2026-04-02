import ShipMap from './components/ShipMap';
import mockShips from './data/mockShips';

export default function App() {
  return <ShipMap ships={mockShips} />;
}