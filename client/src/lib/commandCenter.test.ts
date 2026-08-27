import { describe, expect, it } from "vitest";
import { advancePipelineStep, clampNumber, shiftPan } from "./commandCenter";

describe("GeoSaarthi command-center helpers", () => {
  it("advances staged ingestion without exceeding the final stage", () => {
    expect(advancePipelineStep(0, 5)).toBe(1);
    expect(advancePipelineStep(4, 5)).toBe(4);
  });

  it("clamps imagery control values to their declared range", () => {
    expect(clampNumber(2.6, 0.7, 2.2)).toBe(2.2);
    expect(clampNumber(0.2, 0.7, 2.2)).toBe(0.7);
  });

  it("moves a bounded imagery view without exceeding the pan limit", () => {
    expect(shiftPan({ x: 60, y: -60 }, "x", 18)).toEqual({ x: 72, y: -60 });
    expect(shiftPan({ x: 20, y: 50 }, "y", 40)).toEqual({ x: 20, y: 72 });
  });
});
