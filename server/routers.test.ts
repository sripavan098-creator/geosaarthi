import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnalysisRun } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { demoCases, executeAnalysis } from "./geosaarthi";

const dbMocks = vi.hoisted(() => ({
  createAnalysisRun: vi.fn(),
  getAnalysisRunByRunId: vi.fn(),
  getRecentAnalysisRuns: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function samplePersistedRun(): AnalysisRun {
  const sample = demoCases.find((item) => item.id === "landcover-vqa")!;
  const result = executeAnalysis({ mode: sample.mode, query: sample.query, assets: sample.assets, demoCaseId: sample.id });
  return {
    id: 1,
    runId: result.runId,
    userId: null,
    mode: result.mode,
    task: result.task,
    query: sample.query,
    status: result.status,
    overallConfidence: result.confidence,
    inputMetadataJson: JSON.stringify(sample.assets),
    validationJson: JSON.stringify(result.validation),
    answer: result.answer,
    evidenceJson: JSON.stringify(result.evidence),
    traceJson: JSON.stringify(result.trace),
    provenanceJson: JSON.stringify(result.provenance),
    createdAt: new Date("2026-08-27T00:00:00.000Z"),
  };
}

describe("GeoSaarthi tRPC contracts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("previews intent and validation without creating a persisted run", async () => {
    const sample = demoCases.find((item) => item.id === "flood-fusion")!;
    const caller = appRouter.createCaller(createContext());
    const preview = await caller.geosaarthi.previewAnalysis({ mode: sample.mode, query: sample.query, assets: sample.assets, demoCaseId: sample.id });

    expect(preview.task).toBe("optical_sar_interpretation");
    expect(preview.validation.pairCompatibility).toBe("compatible");
    expect(dbMocks.createAnalysisRun).not.toHaveBeenCalled();
  });

  it("persists only the analysis metadata and trace after execution", async () => {
    dbMocks.createAnalysisRun.mockResolvedValue("gs-persisted");
    const sample = demoCases.find((item) => item.id === "urban-change")!;
    const caller = appRouter.createCaller(createContext());
    const result = await caller.geosaarthi.executeAnalysis({ mode: sample.mode, query: sample.query, assets: sample.assets, demoCaseId: sample.id });

    expect(result.status).toBe("success");
    expect(dbMocks.createAnalysisRun).toHaveBeenCalledTimes(1);
    const payload = dbMocks.createAnalysisRun.mock.calls[0][0];
    expect(payload.inputMetadataJson).toContain("urban_extent_2022.tif");
    expect(payload).not.toHaveProperty("rawImageBytes");
    expect(payload.traceJson).toContain("Intent classification");
  });

  it("returns recent run metadata in a UI-friendly shape", async () => {
    const record = samplePersistedRun();
    dbMocks.getRecentAnalysisRuns.mockResolvedValue([record]);
    const caller = appRouter.createCaller(createContext());
    const runs = await caller.geosaarthi.recentRuns({ limit: 5 });

    expect(runs).toHaveLength(1);
    expect(runs[0]?.runId).toBe(record.runId);
    expect(runs[0]?.inputMetadata).toEqual(JSON.parse(record.inputMetadataJson));
  });

  it("returns a replay-safe analysis record with metadata and trace but no raw imagery", async () => {
    const record = samplePersistedRun();
    dbMocks.getAnalysisRunByRunId.mockResolvedValue(record);
    const caller = appRouter.createCaller(createContext());
    const replay = await caller.geosaarthi.analysisRun({ runId: record.runId });

    expect(replay?.runId).toBe(record.runId);
    expect(replay?.trace).toEqual(JSON.parse(record.traceJson));
    expect(replay?.evidence).toEqual(JSON.parse(record.evidenceJson));
    expect(replay).not.toHaveProperty("rawImageBytes");
  });

  it("returns no replay artifact for an unknown persisted analysis identifier", async () => {
    dbMocks.getAnalysisRunByRunId.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext());

    await expect(caller.geosaarthi.analysisRun({ runId: "gs-missing" })).resolves.toBeNull();
  });

  it("exports a concise report reconstructed from stored metadata", async () => {
    const record = samplePersistedRun();
    dbMocks.getAnalysisRunByRunId.mockResolvedValue(record);
    const caller = appRouter.createCaller(createContext());
    const report = await caller.geosaarthi.exportReport({ runId: record.runId });

    expect(report?.fileName).toContain(record.runId);
    expect(report?.content).toContain("GeoSaarthi analysis report");
    expect(report?.content).toContain("Raw image bytes are not stored");
  });
});
