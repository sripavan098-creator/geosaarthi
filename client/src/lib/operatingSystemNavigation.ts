import { operatingRoutes } from "./operatingSystem";

export function operatingRouteNeighbors(routeId: string) {
  const index = operatingRoutes.findIndex((route) => route.id === routeId);
  const currentIndex = index >= 0 ? index : 0;
  return {
    previous: operatingRoutes[(currentIndex + operatingRoutes.length - 1) % operatingRoutes.length],
    next: operatingRoutes[(currentIndex + 1) % operatingRoutes.length],
  };
}
