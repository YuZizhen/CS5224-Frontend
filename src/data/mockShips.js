export function getMockShips() {
  return [
    {
      id: '1',
      name: 'Ship A',
      lat: 1.29 + (Math.random() - 0.5) * 0.02,
      lng: 103.85 + (Math.random() - 0.5) * 0.02,
    },
    {
      id: '2',
      name: 'Ship B',
      lat: 1.31 + (Math.random() - 0.5) * 0.02,
      lng: 103.83 + (Math.random() - 0.5) * 0.02,
    },
  ];
}