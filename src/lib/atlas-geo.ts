const EARTH_RADIUS = 2.18;
const EARTH_SURFACE_RADIUS = 2.12;

type Point3D = readonly [number, number, number];

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

export function isPositionVisibleFromCamera(
  position: Point3D,
  cameraPosition: Point3D,
  surfaceRadius = EARTH_SURFACE_RADIUS,
): boolean {
  const direction: Point3D = [
    position[0] - cameraPosition[0],
    position[1] - cameraPosition[1],
    position[2] - cameraPosition[2],
  ];
  const directionLengthSquared =
    direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2;
  if (directionLengthSquared <= Number.EPSILON) return true;

  const cameraDirectionDot =
    cameraPosition[0] * direction[0] +
    cameraPosition[1] * direction[1] +
    cameraPosition[2] * direction[2];
  const cameraLengthSquared =
    cameraPosition[0] ** 2 +
    cameraPosition[1] ** 2 +
    cameraPosition[2] ** 2;
  const discriminant =
    (2 * cameraDirectionDot) ** 2 -
    4 *
      directionLengthSquared *
      (cameraLengthSquared - surfaceRadius ** 2);

  // No ray/sphere intersection means the marker sits outside the globe's
  // silhouette. A tangent is kept visible to avoid flicker at the horizon.
  if (discriminant <= 0) return true;

  const nearestIntersection =
    (-2 * cameraDirectionDot - Math.sqrt(discriminant)) /
    (2 * directionLengthSquared);
  return nearestIntersection <= 0 || nearestIntersection >= 1;
}
