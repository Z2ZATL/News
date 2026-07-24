const EARTH_RADIUS = 2.18;

export function coordinatesToPosition(
  latitude: number,
  longitude: number,
  radius = EARTH_RADIUS,
): readonly [number, number, number] {
  const latitudeRadians = latitude * (Math.PI / 180);
  const longitudeRadians = longitude * (Math.PI / 180);
  const latitudeRadius = radius * Math.cos(latitudeRadians);
  return [
    latitudeRadius * Math.cos(longitudeRadians),
    radius * Math.sin(latitudeRadians),
    -latitudeRadius * Math.sin(longitudeRadians),
  ];
}
