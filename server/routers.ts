import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createAnalysisRun, getAnalysisRunByRunId, getRecentAnalysisRuns } from "./db";
import { analysisInputSchema, buildPersistedAnalysisReport, classifyIntent, demoCases, executeAnalysis, modelRegistry, validateAnalysisInput } from "./geosaarthi";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  geosaarthi: router({
    demoCases: publicProcedure.query(() => demoCases),
    modelRegistry: publicProcedure.query(() => modelRegistry),
    previewAnalysis: publicProcedure.input(analysisInputSchema).query(({ input }) => ({
      task: classifyIntent(input.query, input.mode),
      validation: validateAnalysisInput(input),
    })),
    recentRuns: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(24).default(8) }).optional())
      .query(async ({ input }) => {
        const runs = await getRecentAnalysisRuns(input?.limit ?? 8);
        return runs.map((run) => ({
          runId: run.runId,
          mode: run.mode,
          task: run.task,
          query: run.query,
          status: run.status,
          overallConfidence: run.overallConfidence,
          createdAt: run.createdAt,
          inputMetadata: JSON.parse(run.inputMetadataJson) as unknown,
          validation: JSON.parse(run.validationJson) as unknown,
        }));
      }),
    analysisRun: publicProcedure.input(z.object({ runId: z.string().min(3) })).query(async ({ input }) => {
      const run = await getAnalysisRunByRunId(input.runId);
      if (!run) return null;
      return {
        runId: run.runId,
        mode: run.mode,
        task: run.task,
        query: run.query,
        status: run.status,
        overallConfidence: run.overallConfidence,
        createdAt: run.createdAt,
        inputMetadata: JSON.parse(run.inputMetadataJson) as unknown,
        validation: JSON.parse(run.validationJson) as unknown,
        answer: run.answer,
        evidence: JSON.parse(run.evidenceJson) as unknown,
        trace: JSON.parse(run.traceJson) as unknown,
        provenance: JSON.parse(run.provenanceJson) as unknown,
      };
    }),
    executeAnalysis: publicProcedure.input(analysisInputSchema).mutation(async ({ input, ctx }) => {
      const result = executeAnalysis(input);
      await createAnalysisRun({
        runId: result.runId,
        userId: ctx.user?.id ?? null,
        mode: result.mode,
        task: result.task,
        query: input.query,
        status: result.status,
        overallConfidence: result.confidence,
        inputMetadataJson: JSON.stringify(input.assets),
        validationJson: JSON.stringify(result.validation),
        answer: result.answer,
        evidenceJson: JSON.stringify(result.evidence),
        traceJson: JSON.stringify(result.trace),
        provenanceJson: JSON.stringify(result.provenance),
      });
      return result;
    }),
    exportReport: publicProcedure.input(z.object({ runId: z.string().min(3) })).query(async ({ input }) => {
      const run = await getAnalysisRunByRunId(input.runId);
      if (!run) return null;
      return {
        fileName: `geosaarthi-${run.runId}-report.md`,
        content: buildPersistedAnalysisReport(run),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
