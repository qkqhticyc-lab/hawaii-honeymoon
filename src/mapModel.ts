import { places, type Day, type PlaceId, type Route } from './data/trip';
import { mapLocations } from './data/mapLocations';

export function mapStops(routes: Route[]) {
  return [...new Set(routes.flatMap(route => route.stops))].map((id, index) => ({ id, number: index + 1, place: places[id], location: mapLocations[id] }));
}
// A missing location breaks a line. Never bridge across an unknown stop.
export function mapSegments(routes: Route[]) {
  return routes.flatMap((route, routeIndex) => route.stops.slice(1).flatMap((to, index) => {
    const from = route.stops[index];
    if (from === to || !mapLocations[from] || !mapLocations[to]) return [];
    return [{ from, to, mode: route.mode, routeIndex }];
  }));
}
export function coordinate(id: PlaceId): [number, number] | undefined {
  const location = mapLocations[id];
  if (!location) return undefined;
  // Keep Korea and Hawaii in the same Pacific world copy, across the date line.
  return [location.lat, location.lng > 0 ? location.lng - 360 : location.lng];
}
export function initialMapSelection(day: Day) {
  return mapStops(day.routes).find(stop => stop.location && stop.id !== 'icn')?.id;
}
