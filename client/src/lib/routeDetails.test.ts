import { describe, expect, it } from "vitest";
import { operatingRoutes } from "./operatingSystem";
import { routeDetailFor, routeDetails } from "./routeDetails";

describe("GeoSaarthi route detail contracts", () => {
  it("gives every operating-system route three concrete interaction panels", () => {
    expect(Object.keys(routeDetails)).toHaveLength(25);
    for (const route of operatingRoutes) {
      const details = routeDetailFor(route.id);
      expect(details).toHaveLength(3);
      expect(details.every((detail) => detail.title && detail.copy && detail.action)).toBe(true);
    }
  });
});
