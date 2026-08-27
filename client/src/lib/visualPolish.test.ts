import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("GeoSaarthi visual-polish safety", () => {
  it("provides a reduced-motion override for continuous visual effects", () => {
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toContain(".mission-shell::after, .mission-button::after { display: none; }");
    expect(stylesheet).toContain("animation-duration: .01ms !important");
    expect(stylesheet).toContain(".mission-motion-reduced");
  });

  it("avoids layout containment that can hide command-center sections during review", () => {
    expect(stylesheet).not.toContain("content-visibility: auto");
  });
});
