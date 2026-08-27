import { describe, expect, it } from "vitest";
import { buildPersistedAnalysisReport, demoCases, executeAnalysis, validateAnalysisInput } from "./geosaarthi";

describe("GeoSaarthi validation", () => {
  it("accepts the scripted optical–SAR pair", () => {
    const sample = demoCases.find((item) => item.id === "flood-fusion");
    expect(sample).toBeDefined();
    const validation = validateAnalysisInput({ mode: "cross_modal", assets: sample!.assets });
    expect(validation.valid).toBe(true);
    expect(validation.pairCompatibility).toBe("compatible");
  });

  it("rejects a cross-modal request without SAR", () => {
    const sample = demoCases.find((item) => item.id === "landcover-vqa");
    const validation = validateAnalysisInput({ mode: "cross_modal", assets: [sample!.assets[0], { ...sample!.assets[0], assetId: "another-optical" }] });
    expect(validation.valid).toBe(false);
    expect(validation.rejections.join(" ")).toContain("both optical/multispectral imagery and SAR");
  });
});

describe("GeoSaarthi workflow execution", () => {
  it("routes a bi-temporal demo to the change workflow and includes an auditable trace", () => {
    const sample = demoCases.find((item) => item.id === "urban-change");
    const result = executeAnalysis({ mode: sample!.mode, query: sample!.query, assets: sample!.assets, demoCaseId: sample!.id });
    expect(result.task).toBe("change_analysis");
    expect(result.status).toBe("success");
    expect(result.trace.length).toBeGreaterThanOrEqual(5);
    expect(result.reportMarkdown).toContain("GeoSaarthi analysis report");
  });

  it("returns a transparent rejection when a single-image mode receives two assets", () => {
    const sample = demoCases.find((item) => item.id === "urban-change");
    const result = executeAnalysis({ mode: "single", query: "Describe this scene", assets: sample!.assets, demoCaseId: sample!.id });
    expect(result.status).toBe("rejected");
    expect(result.answer).toContain("has not started");
  });

  it("reconstructs a concise metadata-only report from a persisted run shape", () => {
    const sample = demoCases.find((item) => item.id === "landcover-vqa");
    const result = executeAnalysis({ mode: sample!.mode, query: sample!.query, assets: sample!.assets, demoCaseId: sample!.id });
    const report = buildPersistedAnalysisReport({
      id: 1,
      runId: result.runId,
      userId: null,
      mode: result.mode,
      task: result.task,
      query: sample!.query,
      status: result.status,
      overallConfidence: result.confidence,
      inputMetadataJson: JSON.stringify(sample!.assets),
      validationJson: JSON.stringify(result.validation),
      answer: result.answer,
      evidenceJson: JSON.stringify(result.evidence),
      traceJson: JSON.stringify(result.trace),
      provenanceJson: JSON.stringify(result.provenance),
      createdAt: new Date("2026-08-27T00:00:00.000Z"),
    });
    expect(report).toContain("GeoSaarthi analysis report");
    expect(report).toContain("Raw image bytes are not stored");
  });
});
