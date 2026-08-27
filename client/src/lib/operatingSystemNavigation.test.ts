import { describe, expect, it } from "vitest";
import { operatingRouteNeighbors } from "./operatingSystemNavigation";

describe("operating-system keyboard progression", () => {
  it("wraps backward from landing and forward from replay", () => {
    expect(operatingRouteNeighbors("landing").previous.id).toBe("replay");
    expect(operatingRouteNeighbors("replay").next.id).toBe("landing");
  });

  it("returns dashboard neighbors for ordered Alt-arrow navigation", () => {
    const neighbors = operatingRouteNeighbors("dashboard");
    expect(neighbors.previous.id).toBe("landing");
    expect(neighbors.next.id).toBe("new-analysis");
  });

  it("uses the landing position when an unknown route is requested", () => {
    const neighbors = operatingRouteNeighbors("unmapped-route");
    expect(neighbors.previous.id).toBe("replay");
    expect(neighbors.next.id).toBe("dashboard");
  });
});
