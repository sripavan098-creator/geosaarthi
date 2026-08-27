import { describe, expect, it } from "vitest";
import { operatingRoutes, isOperatingRoutePath } from "./operatingSystem";

describe("GeoSaarthi operating-system route architecture", () => {
  it("defines exactly 25 uniquely-addressable experience routes", () => {
    expect(operatingRoutes).toHaveLength(25);
    expect(new Set(operatingRoutes.map((route) => route.id)).size).toBe(25);
    expect(new Set(operatingRoutes.map((route) => route.path)).size).toBe(25);
  });

  it("gives every route a specific centerpiece, interaction, and bounded prototype statement", () => {
    for (const route of operatingRoutes) {
      expect(route.centerpiece.length).toBeGreaterThan(8);
      expect(route.interaction.length).toBeGreaterThan(8);
      expect(route.boundary.length).toBeGreaterThan(12);
      expect(route.number).toMatch(/^\d{2}$/);
    }
  });

  it("recognizes defined paths and rejects unrelated routes", () => {
    expect(isOperatingRoutePath("/workspace")).toBe(true);
    expect(isOperatingRoutePath("/mission-replay")).toBe(false);
  });
});
