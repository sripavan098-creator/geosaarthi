import { nanoid } from "nanoid";
import type { AnalysisRun } from "../drizzle/schema";
import { z } from "zod";

export const analysisModeSchema = z.enum(["single", "bi_temporal", "cross_modal"]);
export const modalitySchema = z.enum(["optical", "multispectral", "sar", "unknown"]);
export const fileTypeSchema = z.enum(["GeoTIFF", "TIFF", "PNG", "JPEG", "unknown"]);

export const analysisAssetSchema = z.object({
  assetId: z.string().min(1),
  fileName: z.string().min(1),
  fileType: fileTypeSchema,
  modality: modalitySchema,
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  bandCount: z.number().int().positive().nullable(),
  crs: z.string().nullable(),
  acquisitionDate: z.string().nullable(),
  source: z.string().min(1),
  sampleId: z.string().nullable(),
});

export const analysisInputSchema = z.object({
  mode: analysisModeSchema,
  query: z.string().trim().min(2).max(500),
  assets: z.array(analysisAssetSchema).min(1).max(2),
  demoCaseId: z.string().optional(),
});

export type AnalysisMode = z.infer<typeof analysisModeSchema>;
export type AnalysisAsset = z.infer<typeof analysisAssetSchema>;
export type AnalysisInput = z.infer<typeof analysisInputSchema>;

type Intent =
  | "vqa"
  | "scene_description"
  | "grounding"
  | "change_analysis"
  | "optical_sar_interpretation"
  | "unsupported";

type ToolId = "rs-vqa-adapter" | "scene-captioner" | "text-grounder" | "change-interpreter" | "optical-sar-fusion";

export type ValidationSummary = {
  valid: boolean;
  imageCount: number;
  modalities: AnalysisAsset["modality"][];
  pairCompatibility: "not_applicable" | "compatible" | "needs_review" | "rejected";
  warnings: string[];
  rejections: string[];
};

export type ExecutionStep = {
  label: string;
  status: "complete" | "warning" | "rejected";
  detail: string;
  elapsedMs: number;
};

export type AnalysisResult = {
  runId: string;
  mode: AnalysisMode;
  task: Intent;
  status: "success" | "partial" | "rejected" | "low_confidence";
  answer: string;
  confidence: number;
  confidenceLabel: "High" | "Review" | "Low";
  confidenceNote: string;
  validation: ValidationSummary;
  evidence: Array<{ id: string; title: string; type: "region" | "change" | "cross_modal" | "caption"; summary: string; region: string; colour: string }>;
  selectedTools: typeof modelRegistry[number][];
  trace: ExecutionStep[];
  provenance: { dataset: string; source: string; retention: string; modelBundle: string; note: string };
  reportMarkdown: string;
};

export const modelRegistry = [
  {
    id: "rs-vqa-adapter" as ToolId,
    name: "Remote-sensing VQA adapter",
    version: "prototype-0.1",
    tasks: ["vqa"],
    acceptedInputs: "Single optical, multispectral, or SAR image",
    output: "Answer, confidence signal, provenance",
    data: "RSVQA / BigEarthNet.txt adaptation path",
    limitation: "Demo adapter; not calibrated for operational use.",
    status: "Ready for scripted demo",
  },
  {
    id: "scene-captioner" as ToolId,
    name: "Scene description adapter",
    version: "prototype-0.1",
    tasks: ["scene_description"],
    acceptedInputs: "Single optical, multispectral, or SAR image",
    output: "Grounded scene summary and confidence signal",
    data: "VRSBench / BigEarthNet.txt adaptation path",
    limitation: "Constrained to supported benchmark-style scenes.",
    status: "Ready for scripted demo",
  },
  {
    id: "text-grounder" as ToolId,
    name: "Text-guided region grounder",
    version: "prototype-0.1",
    tasks: ["grounding"],
    acceptedInputs: "Single optical or multispectral image",
    output: "Region placeholder, evidence label, confidence signal",
    data: "VRSBench grounding evaluation path",
    limitation: "Visual overlay is a prototype placeholder pending model integration.",
    status: "Ready for scripted demo",
  },
  {
    id: "change-interpreter" as ToolId,
    name: "Bi-temporal change interpreter",
    version: "prototype-0.1",
    tasks: ["change_analysis"],
    acceptedInputs: "Two corresponding images from different dates",
    output: "Change description, evidence region, uncertainty",
    data: "CDVQA evaluation path",
    limitation: "Requires spatially corresponding inputs; causality is not inferred.",
    status: "Ready for scripted demo",
  },
  {
    id: "optical-sar-fusion" as ToolId,
    name: "Optical–SAR interpretation adapter",
    version: "prototype-0.1",
    tasks: ["optical_sar_interpretation"],
    acceptedInputs: "One co-registered optical/multispectral and one SAR image",
    output: "Complementary modality interpretation and evidence summary",
    data: "BigEarthNet.txt multimodal adaptation path",
    limitation: "Requires validated co-registration; no unseen-sensor performance claim.",
    status: "Ready for scripted demo",
  },
] as const;

export const demoCases: Array<{
  id: string;
  title: string;
  subtitle: string;
  mode: AnalysisMode;
  query: string;
  workflow: string;
  assets: AnalysisAsset[];
}> = [
  {
    id: "landcover-vqa",
    title: "Land-cover visual question answering",
    subtitle: "Single image · supported VQA",
    mode: "single",
    query: "What land-cover types are visible in this image?",
    workflow: "VQA",
    assets: [{ assetId: "sample-landcover-s2", fileName: "sentinel2_landcover_patch.tif", fileType: "TIFF", modality: "multispectral", width: 1200, height: 1200, bandCount: 12, crs: "EPSG:4326", acquisitionDate: "2024-02-12", source: "Public benchmark sample", sampleId: "demo-landcover-01" }],
  },
  {
    id: "water-grounding",
    title: "Water-body grounding",
    subtitle: "Single image · text-guided region evidence",
    mode: "single",
    query: "Highlight the water body referred to in the image.",
    workflow: "Grounding",
    assets: [{ assetId: "sample-water-s2", fileName: "optical_waterbody_patch.tif", fileType: "TIFF", modality: "optical", width: 1024, height: 1024, bandCount: 4, crs: "EPSG:4326", acquisitionDate: "2024-06-18", source: "Public benchmark sample", sampleId: "demo-water-02" }],
  },
  {
    id: "urban-change",
    title: "Built-up change understanding",
    subtitle: "Bi-temporal pair · change interpretation",
    mode: "bi_temporal",
    query: "Has the built-up area increased, decreased, or remained unchanged?",
    workflow: "Change analysis",
    assets: [
      { assetId: "sample-urban-t1", fileName: "urban_extent_2022.tif", fileType: "TIFF", modality: "optical", width: 1024, height: 1024, bandCount: 4, crs: "EPSG:4326", acquisitionDate: "2022-04-21", source: "Public benchmark sample", sampleId: "demo-urban-t1" },
      { assetId: "sample-urban-t2", fileName: "urban_extent_2024.tif", fileType: "TIFF", modality: "optical", width: 1024, height: 1024, bandCount: 4, crs: "EPSG:4326", acquisitionDate: "2024-04-19", source: "Public benchmark sample", sampleId: "demo-urban-t2" },
    ],
  },
  {
    id: "flood-fusion",
    title: "Optical–SAR flood interpretation",
    subtitle: "Co-registered pair · complementary evidence",
    mode: "cross_modal",
    query: "Use the optical and SAR images together to identify water-covered and built-up regions.",
    workflow: "Optical–SAR interpretation",
    assets: [
      { assetId: "sample-flood-optical", fileName: "flood_optical_patch.tif", fileType: "TIFF", modality: "optical", width: 1024, height: 1024, bandCount: 4, crs: "EPSG:4326", acquisitionDate: "2024-07-09", source: "Public benchmark sample", sampleId: "demo-flood-optical" },
      { assetId: "sample-flood-sar", fileName: "flood_sar_patch.tif", fileType: "TIFF", modality: "sar", width: 1024, height: 1024, bandCount: 1, crs: "EPSG:4326", acquisitionDate: "2024-07-09", source: "Public benchmark sample", sampleId: "demo-flood-sar" },
    ],
  },
];

export function classifyIntent(query: string, mode: AnalysisMode): Intent {
  const text = query.toLowerCase();
  if (mode === "bi_temporal" || /change|increased|decreased|remained|between these dates|compare.*dates/.test(text)) return "change_analysis";
  if (mode === "cross_modal" || /\bsar\b|optical.*sar|sar.*optical|cross.?modal/.test(text)) return "optical_sar_interpretation";
  if (/highlight|ground|locate|where.*water|water body|waterbody/.test(text)) return "grounding";
  if (/describe|caption|land.?cover|major objects|what.*visible/.test(text)) return "scene_description";
  if (/what|which|how many|is there|are there/.test(text)) return "vqa";
  return "unsupported";
}

export function validateAnalysisInput(input: Pick<AnalysisInput, "mode" | "assets">): ValidationSummary {
  const { assets, mode } = input;
  const warnings: string[] = [];
  const rejections: string[] = [];
  const modalities = assets.map((asset) => asset.modality);
  const allowedFormats = new Set(["GeoTIFF", "TIFF", "PNG", "JPEG"]);

  assets.forEach((asset) => {
    if (!allowedFormats.has(asset.fileType)) rejections.push(`${asset.fileName}: use GeoTIFF, TIFF, or an approved benchmark image.`);
    if (asset.fileType === "PNG" || asset.fileType === "JPEG") warnings.push(`${asset.fileName}: approved-image mode has no guaranteed geospatial metadata.`);
    if (!asset.crs) warnings.push(`${asset.fileName}: CRS is unavailable; spatial alignment can only be treated as a benchmark assumption.`);
    if (asset.modality === "unknown") rejections.push(`${asset.fileName}: select optical, multispectral, or SAR before analysis.`);
  });

  let pairCompatibility: ValidationSummary["pairCompatibility"] = "not_applicable";
  if (mode === "single" && assets.length !== 1) rejections.push("Single-image analysis requires exactly one validated asset.");
  if (mode === "bi_temporal") {
    if (assets.length !== 2) rejections.push("Bi-temporal analysis requires two corresponding images from different dates.");
    else {
      const [first, second] = assets;
      const sameShape = first.width === second.width && first.height === second.height;
      const differentDates = Boolean(first.acquisitionDate && second.acquisitionDate && first.acquisitionDate !== second.acquisitionDate);
      if (!sameShape) rejections.push("The two images have different dimensions and cannot be compared reliably in this MVP.");
      if (!differentDates) warnings.push("Acquisition dates are missing or identical; change interpretation needs reviewer confirmation.");
      pairCompatibility = sameShape && differentDates ? "compatible" : "needs_review";
    }
  }
  if (mode === "cross_modal") {
    if (assets.length !== 2) rejections.push("Optical–SAR analysis requires one optical/multispectral asset and one SAR asset.");
    else {
      const hasSar = modalities.includes("sar");
      const hasOptical = modalities.includes("optical") || modalities.includes("multispectral");
      const sameShape = assets[0].width === assets[1].width && assets[0].height === assets[1].height;
      if (!hasSar || !hasOptical) rejections.push("The pair must include both optical/multispectral imagery and SAR imagery.");
      if (!sameShape) rejections.push("The optical and SAR images have different dimensions; co-registration cannot be assumed.");
      pairCompatibility = hasSar && hasOptical && sameShape ? "compatible" : "rejected";
    }
  }

  return { valid: rejections.length === 0, imageCount: assets.length, modalities, pairCompatibility, warnings, rejections };
}

function toolIdsForTask(task: Intent): ToolId[] {
  if (task === "vqa") return ["rs-vqa-adapter"];
  if (task === "scene_description") return ["scene-captioner"];
  if (task === "grounding") return ["text-grounder"];
  if (task === "change_analysis") return ["change-interpreter"];
  if (task === "optical_sar_interpretation") return ["optical-sar-fusion"];
  return [];
}

function answerFor(task: Intent) {
  switch (task) {
    case "vqa": return "The scripted benchmark workflow classifies this as a mixed land-cover scene. Use the evidence panel to inspect the labelled regions before making a domain decision.";
    case "scene_description": return "The scripted scene-description workflow identifies a mixed landscape with vegetated cover, open surface classes, and built structures. This is a bounded demo response, not an operational land-use label.";
    case "grounding": return "The scripted grounding workflow marks the requested water-body candidate in Region A. The overlay is an evidence placeholder that will be replaced by a model-produced mask or bounding region.";
    case "change_analysis": return "The scripted bi-temporal workflow reports visible built-up change in the labelled east corridor. It describes image-level change only and does not infer the cause of that change.";
    case "optical_sar_interpretation": return "The scripted fusion workflow combines optical context with SAR structure: the marked low-backscatter area is reviewed as a water-covered candidate, while the textured regions are reviewed as built-up candidates.";
    default: return "This question is outside the bounded SIH demo. Try a scene description, a visual question, water-body grounding, bi-temporal change, or optical–SAR interpretation.";
  }
}

function evidenceFor(task: Intent): AnalysisResult["evidence"] {
  if (task === "grounding") return [{ id: "ev-region-a", title: "Region A — grounded water-body candidate", type: "region", summary: "Prototype overlay placeholder linked to the text-guided grounding workflow.", region: "South-west quadrant", colour: "blue" }];
  if (task === "change_analysis") return [{ id: "ev-change-east", title: "Change corridor", type: "change", summary: "Prototype change-map placeholder highlighting the reported difference between the two dates.", region: "East corridor", colour: "copper" }];
  if (task === "optical_sar_interpretation") return [{ id: "ev-fusion-pair", title: "Optical–SAR evidence pair", type: "cross_modal", summary: "Paired evidence placeholder: optical context and SAR texture are displayed separately and together.", region: "Co-registered scene extent", colour: "sage" }];
  if (task === "scene_description") return [{ id: "ev-caption-scene", title: "Scene coverage", type: "caption", summary: "Caption evidence placeholder retaining the input modality and scene context.", region: "Full image", colour: "ink" }];
  return [{ id: "ev-vqa-context", title: "Question evidence context", type: "caption", summary: "VQA context placeholder retained with the result for later visual inspection.", region: "Full image", colour: "ink" }];
}

export function executeAnalysis(input: AnalysisInput): AnalysisResult {
  const validation = validateAnalysisInput(input);
  const task = classifyIntent(input.query, input.mode);
  const runId = `gs-${nanoid(9)}`;
  const selectedTools = modelRegistry.filter((tool) => toolIdsForTask(task).includes(tool.id));
  const baseTrace: ExecutionStep[] = [
    { label: "Input metadata inspection", status: validation.valid ? "complete" : "rejected", detail: `${validation.imageCount} asset(s) received; formats and modality declarations inspected.`, elapsedMs: 32 },
    { label: "Pair compatibility check", status: validation.pairCompatibility === "rejected" ? "rejected" : validation.pairCompatibility === "needs_review" ? "warning" : "complete", detail: `Compatibility status: ${validation.pairCompatibility.replace("_", " ")}.`, elapsedMs: 18 },
    { label: "Intent classification", status: task === "unsupported" ? "warning" : "complete", detail: task === "unsupported" ? "No supported SIH demo workflow matched the query." : `Selected ${task.replaceAll("_", " ")} workflow.`, elapsedMs: 14 },
  ];

  if (!validation.valid) {
    const rejected: AnalysisResult = {
      runId, mode: input.mode, task, status: "rejected", answer: "Analysis has not started because the input configuration is not compatible with the selected workflow.", confidence: 0, confidenceLabel: "Low", confidenceNote: "No confidence is reported for rejected input.", validation, evidence: [], selectedTools, trace: [...baseTrace, { label: "Specialist workflow", status: "rejected", detail: "Execution blocked until validation rejections are resolved.", elapsedMs: 0 }], provenance: { dataset: input.assets.map((asset) => asset.source).join("; "), source: input.demoCaseId ? "Scripted benchmark demo" : "Local metadata-only workspace", retention: "Raw image bytes are not stored in the database.", modelBundle: "No model executed", note: "Resolve the validation issues and resubmit." }, reportMarkdown: "",
    };
    rejected.reportMarkdown = buildAnalysisReport(rejected, input.assets, input.query);
    return rejected;
  }

  if (task === "unsupported") {
    const partial: AnalysisResult = {
      runId, mode: input.mode, task, status: "partial", answer: answerFor(task), confidence: 18, confidenceLabel: "Low", confidenceNote: "The intent classifier did not find a supported workflow. This is an uncertainty state, not a model answer.", validation, evidence: [], selectedTools, trace: [...baseTrace, { label: "Specialist workflow", status: "warning", detail: "No compatible specialist workflow is registered for this question.", elapsedMs: 0 }], provenance: { dataset: input.assets.map((asset) => asset.source).join("; "), source: input.demoCaseId ? "Scripted benchmark demo" : "Local metadata-only workspace", retention: "Raw image bytes are not stored in the database.", modelBundle: "No specialist model selected", note: "Supported intents are limited to the bounded SIH MVP." }, reportMarkdown: "",
    };
    partial.reportMarkdown = buildAnalysisReport(partial, input.assets, input.query);
    return partial;
  }

  const forceLowConfidence = /uncertain|low confidence|ambiguous|blurry/.test(input.query.toLowerCase());
  const confidence = forceLowConfidence ? 42 : task === "optical_sar_interpretation" ? 84 : task === "change_analysis" ? 86 : 89;
  const status: AnalysisResult["status"] = forceLowConfidence ? "low_confidence" : "success";
  const result: AnalysisResult = {
    runId,
    mode: input.mode,
    task,
    status,
    answer: answerFor(task),
    confidence,
    confidenceLabel: confidence >= 80 ? "High" : confidence >= 60 ? "Review" : "Low",
    confidenceNote: forceLowConfidence ? "Prototype confidence signal: input language requests uncertainty; human review is required." : "Prototype confidence signal for the scripted workflow. It is not a calibrated operational probability.",
    validation,
    evidence: evidenceFor(task),
    selectedTools,
    trace: [...baseTrace, { label: "Specialist workflow", status: "complete", detail: `${selectedTools.map((tool) => tool.name).join(", ")} executed in scripted prototype mode.`, elapsedMs: 126 }, { label: "Evidence and trace packaging", status: "complete", detail: "Result, evidence placeholder, confidence note, provenance, and run trace prepared.", elapsedMs: 21 }],
    provenance: { dataset: input.assets.map((asset) => asset.source).join("; "), source: input.demoCaseId ? "Scripted benchmark demo" : "Local metadata-only workspace", retention: "Raw image bytes are not stored in the database.", modelBundle: selectedTools.map((tool) => `${tool.name} (${tool.version})`).join("; "), note: "Benchmark demo outputs are transparent prototypes awaiting real model integration and evaluation." },
    reportMarkdown: "",
  };
  result.reportMarkdown = buildAnalysisReport(result, input.assets, input.query);
  return result;
}

export function buildAnalysisReport(result: AnalysisResult, assets: AnalysisAsset[], query: string) {
  const validationNotes = [...result.validation.warnings, ...result.validation.rejections];
  return `# GeoSaarthi analysis report\n\n**Run ID:** ${result.runId}\n**Status:** ${result.status}\n**Mode:** ${result.mode}\n**Workflow:** ${result.task}\n**Created:** ${new Date().toISOString()}\n\n## Query\n${query}\n\n## Input metadata\n${assets.map((asset) => `- ${asset.fileName} · ${asset.fileType} · ${asset.modality} · ${asset.width ?? "unknown"}×${asset.height ?? "unknown"} · ${asset.crs ?? "CRS unavailable"}`).join("\n")}\n\n## Validation\n- Image count: ${result.validation.imageCount}\n- Pair compatibility: ${result.validation.pairCompatibility}\n${validationNotes.length ? validationNotes.map((note) => `- ${note}`).join("\n") : "- No validation warnings or rejections."}\n\n## Result\n${result.answer}\n\n**Confidence:** ${result.confidenceLabel} (${result.confidence}/100)\n${result.confidenceNote}\n\n## Evidence references\n${result.evidence.length ? result.evidence.map((item) => `- ${item.title}: ${item.summary} (${item.region})`).join("\n") : "- No evidence was generated because analysis did not run."}\n\n## Specialist tools\n${result.selectedTools.length ? result.selectedTools.map((tool) => `- ${tool.name} · ${tool.version}`).join("\n") : "- No tool selected."}\n\n## Execution trace\n${result.trace.map((step, index) => `${index + 1}. ${step.label} — ${step.status}: ${step.detail} (${step.elapsedMs} ms)`).join("\n")}\n\n## Provenance and responsible-AI note\n- Dataset/source: ${result.provenance.dataset}\n- Workspace source: ${result.provenance.source}\n- Retention: ${result.provenance.retention}\n- Model bundle: ${result.provenance.modelBundle}\n- Note: ${result.provenance.note}\n\n> This report is a bounded SIH26167 prototype output. It is an AI-assisted interpretation, not a certified operational decision.\n`;
}

export function buildPersistedAnalysisReport(run: AnalysisRun) {
  const assets = JSON.parse(run.inputMetadataJson) as AnalysisAsset[];
  const validation = JSON.parse(run.validationJson) as ValidationSummary;
  const evidence = JSON.parse(run.evidenceJson) as AnalysisResult["evidence"];
  const trace = JSON.parse(run.traceJson) as ExecutionStep[];
  const provenance = JSON.parse(run.provenanceJson) as AnalysisResult["provenance"];
  const notes = [...validation.warnings, ...validation.rejections];
  return `# GeoSaarthi analysis report\n\n**Run ID:** ${run.runId}\n**Status:** ${run.status}\n**Mode:** ${run.mode}\n**Workflow:** ${run.task}\n**Created:** ${run.createdAt.toISOString()}\n\n## Query\n${run.query}\n\n## Input metadata\n${assets.map((asset) => `- ${asset.fileName} · ${asset.fileType} · ${asset.modality} · ${asset.width ?? "unknown"}×${asset.height ?? "unknown"} · ${asset.crs ?? "CRS unavailable"}`).join("\n")}\n\n## Validation\n- Image count: ${validation.imageCount}\n- Pair compatibility: ${validation.pairCompatibility}\n${notes.length ? notes.map((note) => `- ${note}`).join("\n") : "- No validation warnings or rejections."}\n\n## Result\n${run.answer}\n\n**Confidence:** ${run.overallConfidence}/100\n\n## Evidence references\n${evidence.length ? evidence.map((item) => `- ${item.title}: ${item.summary} (${item.region})`).join("\n") : "- No evidence was generated because analysis did not run."}\n\n## Execution trace\n${trace.map((step, index) => `${index + 1}. ${step.label} — ${step.status}: ${step.detail} (${step.elapsedMs} ms)`).join("\n")}\n\n## Provenance and responsible-AI note\n- Dataset/source: ${provenance.dataset}\n- Workspace source: ${provenance.source}\n- Retention: ${provenance.retention}\n- Model bundle: ${provenance.modelBundle}\n- Note: ${provenance.note}\n\n> This report is a bounded SIH26167 prototype output. It is an AI-assisted interpretation, not a certified operational decision.\n`;
}
