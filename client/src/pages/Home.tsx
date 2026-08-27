import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  FileCheck2,
  FileText,
  FlaskConical,
  FolderSearch2,
  History,
  Info,
  Layers3,
  MapPinned,
  Network,
  Radar,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Mode = "single" | "bi_temporal" | "cross_modal";
type Modality = "optical" | "multispectral" | "sar" | "unknown";
type FileType = "GeoTIFF" | "TIFF" | "PNG" | "JPEG" | "unknown";
type Asset = {
  assetId: string;
  fileName: string;
  fileType: FileType;
  modality: Modality;
  width: number | null;
  height: number | null;
  bandCount: number | null;
  crs: string | null;
  acquisitionDate: string | null;
  source: string;
  sampleId: string | null;
};

const modeMeta: Record<Mode, { title: string; copy: string; icon: typeof ScanSearch; expected: string }> = {
  single: { title: "Single image", copy: "Ask about a single optical, multispectral, or SAR scene.", icon: ScanSearch, expected: "1 asset" },
  bi_temporal: { title: "Bi-temporal", copy: "Compare two dates to interpret visible change.", icon: Activity, expected: "2 dates" },
  cross_modal: { title: "Optical–SAR", copy: "Fuse co-registered optical and SAR evidence.", icon: Layers3, expected: "2 modalities" },
};

const navItems = [
  { id: "workspace", label: "Analysis workspace", icon: ScanSearch },
  { id: "demo-cases", label: "Demo cases", icon: FlaskConical },
  { id: "registry", label: "Model registry", icon: Network },
  { id: "recent-runs", label: "Recent runs", icon: History },
  { id: "context", label: "Project context", icon: Info },
];

function fileTypeFromName(name: string): FileType {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "tif") return "TIFF";
  if (extension === "tiff") return "GeoTIFF";
  if (extension === "png") return "PNG";
  if (extension === "jpg" || extension === "jpeg") return "JPEG";
  return "unknown";
}

function formatMode(mode: string) {
  return mode.replace("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function formatTask(task: string) {
  return task.replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function statusPillClass(status: string) {
  if (status === "success" || status === "complete") return "geo-pill geo-pill-valid";
  if (status === "rejected" || status === "error") return "geo-pill geo-pill-review";
  if (status === "low_confidence" || status === "warning") return "geo-pill geo-pill-review";
  return "geo-pill geo-pill-muted";
}

export default function Home() {
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<Mode>("single");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [query, setQuery] = useState("Describe the land-cover and major objects visible in this image.");
  const [activeSection, setActiveSection] = useState("workspace");
  const [result, setResult] = useState<ReturnType<typeof useAnalysisResultState>[0]>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const demoCasesQuery = trpc.geosaarthi.demoCases.useQuery();
  const registryQuery = trpc.geosaarthi.modelRegistry.useQuery();
  const recentRunsQuery = trpc.geosaarthi.recentRuns.useQuery({ limit: 8 });

  const previewInput = useMemo(() => ({ mode, query: query.trim() || "Describe this scene", assets, demoCaseId: undefined }), [mode, query, assets]);
  const previewQuery = trpc.geosaarthi.previewAnalysis.useQuery(previewInput, { enabled: assets.length > 0, retry: false });
  const executeMutation = trpc.geosaarthi.executeAnalysis.useMutation({
    onSuccess: (analysis) => {
      setResult(analysis);
      void utils.geosaarthi.recentRuns.invalidate();
      toast.success(analysis.status === "success" ? "Analysis trace prepared" : "Analysis returned a review state");
    },
    onError: () => toast.error("The analysis workspace could not complete this request."),
  });

  function scrollToSection(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetWorkspace(nextMode: Mode) {
    setMode(nextMode);
    setAssets([]);
    setResult(null);
    setQuery(nextMode === "bi_temporal" ? "What changed between these two dates, and where did the change occur?" : nextMode === "cross_modal" ? "Use the optical and SAR images together to identify water-covered and built-up regions." : "Describe the land-cover and major objects visible in this image.");
  }

  function useDemo(demoId: string) {
    const demo = demoCasesQuery.data?.find((item) => item.id === demoId);
    if (!demo) return;
    setMode(demo.mode);
    setAssets(demo.assets as Asset[]);
    setQuery(demo.query);
    setResult(null);
    scrollToSection("workspace");
    toast.message(`${demo.title} loaded into the workspace`);
  }

  function loadLowConfidenceDemo() {
    const demo = demoCasesQuery.data?.find((item) => item.id === "landcover-vqa");
    if (!demo) return;
    setMode("single");
    setAssets(demo.assets as Asset[]);
    setQuery("Describe this blurry, uncertain scene with low confidence.");
    setResult(null);
    scrollToSection("workspace");
    toast.message("Low-confidence review state loaded");
  }

  function loadInvalidInputDemo() {
    const demo = demoCasesQuery.data?.find((item) => item.id === "water-grounding");
    if (!demo) return;
    setMode("cross_modal");
    setAssets(demo.assets as Asset[]);
    setQuery("Use the optical and SAR images together to identify water-covered regions.");
    setResult(null);
    scrollToSection("workspace");
    toast.message("Invalid optical–SAR configuration loaded");
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const chosen = Array.from(files).slice(0, mode === "single" ? 1 : 2);
    const newAssets: Asset[] = chosen.map((file, index) => {
      const requiredModality: Modality = mode === "cross_modal" ? (index === 0 ? "optical" : "sar") : "optical";
      const acquisitionDate = mode === "bi_temporal" ? (index === 0 ? "2023-07-01" : "2024-07-01") : "2024-07-09";
      return { assetId: `local-${Date.now()}-${index}`, fileName: file.name, fileType: fileTypeFromName(file.name), modality: requiredModality, width: null, height: null, bandCount: null, crs: null, acquisitionDate, source: "Local browser upload · metadata only", sampleId: null };
    });
    setAssets(newAssets);
    setResult(null);
    toast.message("Files added for metadata validation. Raw bytes remain in this browser session.");
  }

  function updateAsset(index: number, key: "modality" | "acquisitionDate", value: string) {
    setAssets((current) => current.map((asset, assetIndex) => assetIndex === index ? { ...asset, [key]: value } : asset));
    setResult(null);
  }

  function startAnalysis() {
    if (!assets.length) { toast.error("Choose a benchmark case or add supported image metadata first."); return; }
    executeMutation.mutate({ ...previewInput });
  }

  function downloadReport() {
    if (!result?.reportMarkdown) return;
    const blob = new Blob([result.reportMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `geosaarthi-${result.runId}-report.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const validation = previewQuery.data?.validation;
  const intent = previewQuery.data?.task;
  const activeMode = modeMeta[mode];

  return (
    <div className="geo-shell">
      <aside className="geo-nav flex flex-col p-4">
        <div className="mb-7 flex items-center gap-3 px-2 pt-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#24231f] text-white"><Radar className="size-5" /></div>
          <div><p className="geo-serif text-[22px] leading-none">GeoSaarthi</p><p className="geo-kicker mt-1 text-[9px]">SatQuery AI / SIH26167</p></div>
        </div>
        <nav className="space-y-1" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => scrollToSection(item.id)} className={`geo-nav-item ${activeSection === item.id ? "geo-nav-item-active" : ""}`}><Icon className="size-4" />{item.label}<ChevronRight className="ml-auto size-3.5 opacity-45" /></button>;
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-[#dedcd4] bg-[#f7f6f2] p-3">
          <div className="flex items-center gap-2 text-[#526d58]"><ShieldCheck className="size-4" /><span className="text-xs font-bold">Bounded MVP</span></div>
          <p className="mt-2 text-[11px] leading-4 text-[#706f68]">Transparent demo workflows. No operational claim. No raw-image database storage.</p>
        </div>
      </aside>

      <main className="geo-main">
        <div className="border-b border-[#dedcd4] bg-[#fffdfc]/75 px-5 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto">{navItems.map((item) => <button key={item.id} onClick={() => scrollToSection(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${activeSection === item.id ? "bg-[#355c7d] text-white" : "bg-[#eeede7] text-[#706f68]"}`}>{item.label}</button>)}</div>
        </div>
        <div className="geo-content">
          <section id="workspace" className="scroll-mt-8">
            <div className="mb-8 flex flex-col gap-5 border-b border-[#dedcd4] pb-7 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl"><p className="geo-kicker">Analysis workspace · prototype 0.1</p><h1 className="geo-title mt-3">Make the evidence path <em className="text-[#355c7d]">visible.</em></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#706f68]">A guided workspace for the bounded SIH26167 MVP: validate remote-sensing inputs, route a supported question, and inspect the evidence, provenance, confidence, and execution trace.</p></div>
              <div className="flex items-center gap-3"><div className="geo-pill geo-pill-blue"><Sparkles className="size-3" /> Scripted analysis</div><button className="geo-secondary" onClick={() => scrollToSection("context")}>View SIH scope <ArrowUpRight className="size-3.5" /></button></div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.85fr)]">
              <section className="geo-panel overflow-hidden">
                <div className="border-b border-[#dedcd4] px-5 py-4"><div className="flex items-center justify-between"><div><p className="geo-label">01 / Configure analysis</p><h2 className="geo-section-title mt-1">Choose your evidence mode</h2></div><span className="geo-pill geo-pill-muted">{activeMode.expected}</span></div></div>
                <div className="p-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    {(Object.keys(modeMeta) as Mode[]).map((modeKey) => { const item = modeMeta[modeKey]; const Icon = item.icon; return <button key={modeKey} onClick={() => resetWorkspace(modeKey)} className={`geo-mode ${mode === modeKey ? "geo-mode-active" : ""}`}><div className="flex items-center justify-between"><Icon className="size-5 text-[#355c7d]" /><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#706f68]">{item.expected}</span></div><p className="mt-5 text-sm font-bold text-[#24231f]">{item.title}</p><p className="mt-1 text-xs leading-4 text-[#706f68]">{item.copy}</p></button>; })}
                  </div>

                  <div className="mt-6 flex items-center justify-between"><div><p className="geo-label">02 / Input assets</p><p className="mt-1 text-sm text-[#706f68]">Use a verified benchmark case or add supported local files.</p></div><button className="geo-secondary" onClick={() => uploadRef.current?.click()}><UploadCloud className="size-4" /> Add files</button><input ref={uploadRef} className="hidden" type="file" accept=".tif,.tiff,.png,.jpg,.jpeg" multiple={mode !== "single"} onChange={(event) => handleFiles(event.target.files)} /></div>
                  <div className="mt-3 min-h-36 rounded-xl border border-dashed border-[#c9c6bc] bg-[#f7f6f2] p-3">
                    {assets.length === 0 ? <div className="flex min-h-28 flex-col items-center justify-center text-center"><FolderSearch2 className="size-6 text-[#a09e95]" /><p className="mt-2 text-sm font-semibold">No input assets selected</p><p className="mt-1 max-w-sm text-xs leading-4 text-[#706f68]">GeoTIFF/TIFF is preferred. PNG and JPEG are accepted only for prescribed benchmark-style demos.</p></div> : <div className="space-y-2">{assets.map((asset, index) => <div key={asset.assetId} className="rounded-lg border border-[#dedcd4] bg-[#fffdfc] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><FileCheck2 className="size-4 shrink-0 text-[#526d58]" /><p className="truncate text-sm font-bold">{asset.fileName}</p></div><p className="mt-1 pl-6 text-[11px] text-[#706f68]">{asset.fileType} · {asset.source} · {asset.crs ?? "CRS not attached"}</p></div><button onClick={() => { setAssets((current) => current.filter((_, itemIndex) => itemIndex !== index)); setResult(null); }} className="text-[#a09e95] hover:text-[#b86b3d]" aria-label={`Remove ${asset.fileName}`}><X className="size-4" /></button></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-[11px] font-semibold text-[#706f68]">Modality<select className="geo-input mt-1 py-2 text-xs" value={asset.modality} onChange={(event) => updateAsset(index, "modality", event.target.value)}><option value="optical">Optical</option><option value="multispectral">Multispectral</option><option value="sar">SAR</option><option value="unknown">Unknown</option></select></label><label className="text-[11px] font-semibold text-[#706f68]">Acquisition date<select className="geo-input mt-1 py-2 text-xs" value={asset.acquisitionDate ?? "unknown"} onChange={(event) => updateAsset(index, "acquisitionDate", event.target.value === "unknown" ? "" : event.target.value)}><option value="2023-07-01">2023-07-01</option><option value="2024-07-09">2024-07-09</option><option value="2024-07-01">2024-07-01</option><option value="unknown">Unknown</option></select></label></div></div>)}</div>}
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#eef2f5] px-3 py-2.5 text-xs leading-4 text-[#5c6f7f]"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" />Files are kept in the current browser session for this bounded UI demo. Only run metadata, evidence references, and traces are persisted; raw image bytes are never stored in the database.</div>

                  <div className="mt-6 border-t border-[#dedcd4] pt-5"><p className="geo-label">03 / Natural-language request</p><div className="mt-2 flex gap-2"><textarea value={query} onChange={(event) => setQuery(event.target.value)} className="geo-input min-h-24 resize-none leading-5" maxLength={500} placeholder="Ask a supported question about the selected imagery…" /><button className="geo-primary self-end" onClick={startAnalysis} disabled={executeMutation.isPending || !assets.length}>{executeMutation.isPending ? <Clock3 className="size-4 animate-spin" /> : <Send className="size-4" />}{executeMutation.isPending ? "Tracing" : "Run analysis"}</button></div><div className="mt-2 flex flex-wrap gap-2"><span className="text-[11px] text-[#706f68]">Try:</span>{["Describe this scene", "Highlight the water body", "What changed between these dates?", "Use optical and SAR together"].map((suggestion) => <button key={suggestion} onClick={() => setQuery(suggestion)} className="rounded-full border border-[#dedcd4] bg-[#fffdfc] px-2.5 py-1 text-[11px] font-medium text-[#5c6f7f] hover:border-[#355c7d] hover:text-[#355c7d]">{suggestion}</button>)}</div></div>
                </div>
              </section>

              <aside className="geo-panel overflow-hidden">
                <div className="border-b border-[#dedcd4] px-5 py-4"><p className="geo-label">Pre-analysis inspection</p><h2 className="geo-section-title mt-1">Validation before inference</h2></div>
                <div className="p-5">
                  {!assets.length ? <div className="flex min-h-72 flex-col justify-between"><div className="rounded-xl border border-dashed border-[#c9c6bc] p-4"><CircleAlert className="size-5 text-[#b86b3d]" /><p className="mt-3 text-sm font-bold">Waiting for input metadata</p><p className="mt-1 text-xs leading-5 text-[#706f68]">Select a demo case or add an image to inspect format, modality, image count, pair compatibility, warnings, and routing intent.</p></div><div className="rounded-xl bg-[#f7f6f2] p-4"><p className="geo-label">Required proof</p><p className="mt-2 text-xs leading-5 text-[#706f68]">The system should reject incompatible input before a specialist workflow begins.</p></div></div> : <div className="space-y-4"><div className="flex items-center justify-between"><span className={validation?.valid ? "geo-pill geo-pill-valid" : "geo-pill geo-pill-review"}>{validation?.valid ? <CheckCircle2 className="size-3" /> : <CircleAlert className="size-3" />}{validation?.valid ? "Input valid" : "Input needs attention"}</span><span className="text-xs font-semibold text-[#706f68]">{validation?.imageCount ?? 0} asset(s)</span></div><div className="grid grid-cols-2 gap-2"><div className="rounded-lg bg-[#f7f6f2] p-3"><p className="geo-label">Mode</p><p className="mt-1 text-sm font-bold">{formatMode(mode)}</p></div><div className="rounded-lg bg-[#f7f6f2] p-3"><p className="geo-label">Intent</p><p className="mt-1 text-sm font-bold">{intent ? formatTask(intent) : "Checking…"}</p></div><div className="rounded-lg bg-[#f7f6f2] p-3"><p className="geo-label">Modalities</p><p className="mt-1 text-sm font-bold">{validation?.modalities.join(" · ")}</p></div><div className="rounded-lg bg-[#f7f6f2] p-3"><p className="geo-label">Pair state</p><p className="mt-1 text-sm font-bold">{formatMode(validation?.pairCompatibility ?? "not applicable")}</p></div></div>{validation?.warnings.length ? <div className="rounded-xl border border-[#e5d4c5] bg-[#fff8f3] p-3"><p className="flex items-center gap-2 text-xs font-bold text-[#a05d32]"><CircleAlert className="size-3.5" /> Review before analysis</p><ul className="mt-2 space-y-1 text-xs leading-4 text-[#80563d]">{validation.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div> : null}{validation?.rejections.length ? <div className="rounded-xl border border-[#e5c7bd] bg-[#fff5f2] p-3"><p className="flex items-center gap-2 text-xs font-bold text-[#a84f37]"><CircleAlert className="size-3.5" /> Analysis blocked</p><ul className="mt-2 space-y-1 text-xs leading-4 text-[#874b39]">{validation.rejections.map((rejection) => <li key={rejection}>• {rejection}</li>)}</ul></div> : <div className="rounded-xl border border-[#cedecf] bg-[#f4f8f3] p-3"><p className="flex items-center gap-2 text-xs font-bold text-[#526d58]"><ShieldCheck className="size-3.5" /> Workflow is compatible</p><p className="mt-1 text-xs leading-4 text-[#526d58]">Continue to run the bounded prototype. Confidence and evidence remain visible in the result.</p></div>}</div>}
                </div>
              </aside>
            </div>

            <section className="geo-panel mt-5 overflow-hidden" aria-live="polite">
              <div className="flex flex-col gap-3 border-b border-[#dedcd4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="geo-label">Evidence-grounded result</p><h2 className="geo-section-title mt-1">{result ? "Analysis response" : "Ready for a traceable run"}</h2></div>{result ? <div className="flex items-center gap-2"><span className={statusPillClass(result.status)}>{result.status.replace("_", " ")}</span><button className="geo-secondary" onClick={downloadReport}><ArrowDownToLine className="size-4" /> Export report</button></div> : null}</div>
              {!result ? <div className="geo-grid-pattern flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="flex size-12 items-center justify-center rounded-full border border-[#c4d2df] bg-[#fffdfc] text-[#355c7d]"><Sparkles className="size-5" /></div><p className="mt-4 text-base font-bold">No analysis result yet</p><p className="mt-2 max-w-md text-sm leading-6 text-[#706f68]">Load a benchmark case or add supported input metadata, inspect the validation, then run a supported query. The trace will stay visible with the result.</p></div> : <div className="grid xl:grid-cols-[.95fr_1.05fr]"><div className="border-b border-[#dedcd4] p-5 xl:border-b-0 xl:border-r"><div className="flex items-start justify-between gap-3"><div><p className="geo-label">Answer · {formatTask(result.task)}</p><p className="geo-serif mt-2 text-[25px] leading-8">{result.answer}</p></div><div className={`min-w-20 rounded-xl border p-2 text-center ${result.confidence >= 80 ? "border-[#cedecf] bg-[#f4f8f3] text-[#526d58]" : "border-[#e5d4c5] bg-[#fff8f3] text-[#a05d32]"}`}><p className="text-xl font-bold">{result.confidence}</p><p className="text-[10px] font-bold uppercase tracking-[.12em]">{result.confidenceLabel}</p></div></div><p className="mt-4 border-l-2 border-[#b86b3d] pl-3 text-xs leading-5 text-[#706f68]">{result.confidenceNote}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{result.evidence.length ? result.evidence.map((evidence) => <div key={evidence.id} className="overflow-hidden rounded-xl border border-[#dedcd4]"><div className={`geo-grid-pattern relative flex h-32 items-end p-3 ${evidence.colour === "copper" ? "geo-overlay-copper" : evidence.colour === "sage" ? "geo-overlay-sage" : evidence.colour === "blue" ? "geo-overlay-blue" : ""}`}><div className="rounded bg-[#fffdfc]/90 px-2 py-1 text-[10px] font-bold text-[#24231f]">Evidence placeholder · {evidence.region}</div></div><div className="p-3"><p className="text-xs font-bold">{evidence.title}</p><p className="mt-1 text-[11px] leading-4 text-[#706f68]">{evidence.summary}</p></div></div>) : <div className="rounded-xl border border-dashed border-[#d7c9bd] bg-[#fff8f3] p-4 text-xs leading-5 text-[#80563d]">No visual evidence was produced because the current input was rejected or the query falls outside the bounded workflow registry.</div>}</div><div className="mt-5 rounded-xl bg-[#f7f6f2] p-4"><p className="geo-label">Provenance</p><dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><div><dt className="text-[#706f68]">Source</dt><dd className="mt-1 font-semibold">{result.provenance.source}</dd></div><div><dt className="text-[#706f68]">Model bundle</dt><dd className="mt-1 font-semibold">{result.provenance.modelBundle}</dd></div><div><dt className="text-[#706f68]">Retention</dt><dd className="mt-1 font-semibold">{result.provenance.retention}</dd></div><div><dt className="text-[#706f68]">Dataset</dt><dd className="mt-1 font-semibold">{result.provenance.dataset}</dd></div></dl></div></div>
                <div className="p-5"><div className="flex items-center justify-between"><div><p className="geo-label">Execution trace</p><p className="mt-1 text-sm font-bold">Every decision is inspectable.</p></div><Bot className="size-5 text-[#355c7d]" /></div><div className="mt-5 space-y-0">{result.trace.map((step, index) => <div key={`${step.label}-${index}`} className="relative flex gap-3 border-l border-[#dedcd4] pb-5 pl-5 last:pb-0"><span className={`absolute -left-[5px] top-1 size-2.5 rounded-full ${step.status === "complete" ? "bg-[#526d58]" : step.status === "warning" ? "bg-[#b86b3d]" : "bg-[#b84f3d]"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{step.label}</p><span className={statusPillClass(step.status)}>{step.status}</span><span className="text-[10px] text-[#a09e95]">{step.elapsedMs} ms</span></div><p className="mt-1 text-xs leading-5 text-[#706f68]">{step.detail}</p></div></div>)}</div><div className="mt-5 rounded-xl border border-[#dedcd4] p-3"><p className="text-xs font-bold">Selected specialist tools</p><div className="mt-2 flex flex-wrap gap-2">{result.selectedTools.length ? result.selectedTools.map((tool) => <span key={tool.id} className="geo-pill geo-pill-blue">{tool.name}</span>) : <span className="text-xs text-[#706f68]">No specialist tool selected.</span>}</div></div></div>
              </div>}
            </section>
          </section>

          <section id="demo-cases" className="mt-12 scroll-mt-8"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="geo-kicker">Scripted benchmark workflows</p><h2 className="geo-section-title mt-1">Demo cases that prove the required paths</h2></div><div className="flex flex-wrap items-center gap-2"><span className="hidden text-xs text-[#706f68] sm:block">Four mandatory SIH workflows</span><button className="geo-secondary !px-3 !py-2 text-xs" onClick={loadLowConfidenceDemo}><CircleAlert className="size-3.5 text-[#b86b3d]" /> Inspect uncertainty</button><button className="geo-secondary !px-3 !py-2 text-xs" onClick={loadInvalidInputDemo}><ShieldCheck className="size-3.5 text-[#b86b3d]" /> Inspect rejection</button></div></div><div className="flex gap-3 overflow-x-auto pb-2">{demoCasesQuery.data?.map((demo, index) => <button key={demo.id} onClick={() => useDemo(demo.id)} className="geo-demo"><div className="flex items-center justify-between"><span className="geo-pill geo-pill-blue">0{index + 1}</span><ArrowUpRight className="size-4 text-[#a09e95]" /></div><p className="mt-5 text-sm font-bold">{demo.title}</p><p className="mt-1 text-xs leading-4 text-[#706f68]">{demo.subtitle}</p><div className="mt-4 border-t border-[#dedcd4] pt-3 text-[11px] font-bold text-[#355c7d]">{demo.workflow}</div></button>)}</div></section>

          <section id="registry" className="mt-12 scroll-mt-8"><div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]"><div className="geo-panel p-5"><p className="geo-kicker">Auditable specialist-workflow registry</p><h2 className="geo-section-title mt-2">The system never hides its choice of tools.</h2><p className="mt-4 text-sm leading-6 text-[#706f68]">Each adapter declares its accepted input, intended output, data pathway, version, and known limitation. The router only selects a compatible registered workflow.</p><div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#526d58]"><ShieldCheck className="size-4" /> Registry contracts are part of the evidence trail.</div></div><div className="geo-panel overflow-hidden"><div className="grid grid-cols-[1.15fr_.85fr_.85fr] border-b border-[#dedcd4] bg-[#f7f6f2] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#706f68]"><span>Specialist adapter</span><span>Task</span><span>Readiness</span></div>{registryQuery.data?.map((tool) => <details key={tool.id} className="group border-b border-[#dedcd4] last:border-0"><summary className="grid cursor-pointer grid-cols-[1.15fr_.85fr_.85fr] items-center px-5 py-4 text-sm marker:hidden"><span className="font-bold">{tool.name}<span className="mt-1 block text-[11px] font-normal text-[#706f68]">{tool.version}</span></span><span className="text-xs text-[#5c6f7f]">{tool.tasks.map(formatTask).join(", ")}</span><span><span className="geo-pill geo-pill-valid">{tool.status}</span></span></summary><div className="grid gap-3 border-t border-[#eeeae1] bg-[#faf9f6] px-5 py-4 text-xs leading-5 text-[#706f68] md:grid-cols-3"><p><strong className="text-[#24231f]">Accepted input</strong><br />{tool.acceptedInputs}</p><p><strong className="text-[#24231f]">Data path</strong><br />{tool.data}</p><p><strong className="text-[#24231f]">Known limitation</strong><br />{tool.limitation}</p></div></details>)}</div></div></section>

          <section id="recent-runs" className="mt-12 scroll-mt-8"><div className="geo-panel overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#dedcd4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="geo-kicker">Persisted metadata only</p><h2 className="geo-section-title mt-1">Recent analysis runs</h2></div><div className="geo-pill geo-pill-muted"><Database className="size-3" /> No raw images stored</div></div><div className="overflow-x-auto"><table className="min-w-full text-left"><thead className="bg-[#f7f6f2] text-[10px] uppercase tracking-[.12em] text-[#706f68]"><tr><th className="px-5 py-3 font-bold">Run</th><th className="px-5 py-3 font-bold">Mode / workflow</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold">Confidence</th><th className="px-5 py-3 font-bold">Created</th></tr></thead><tbody>{recentRunsQuery.data?.length ? recentRunsQuery.data.map((run) => <tr key={run.runId} className="border-t border-[#eeeae1] text-sm"><td className="px-5 py-4"><p className="font-bold">{run.runId}</p><p className="mt-1 max-w-60 truncate text-xs text-[#706f68]">{run.query}</p></td><td className="px-5 py-4 text-xs text-[#5c6f7f]">{formatMode(run.mode)}<br /><span className="font-semibold text-[#24231f]">{formatTask(run.task)}</span></td><td className="px-5 py-4"><span className={statusPillClass(run.status)}>{run.status.replace("_", " ")}</span></td><td className="px-5 py-4 text-sm font-bold">{run.overallConfidence}/100</td><td className="px-5 py-4 text-xs text-[#706f68]">{new Date(run.createdAt).toLocaleString()}</td></tr>) : <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[#706f68]">Run an analysis to create the first metadata-only record.</td></tr>}</tbody></table></div></div></section>

          <section id="context" className="mt-12 scroll-mt-8"><div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]"><div className="geo-panel p-6"><p className="geo-kicker">SIH26167 / Project context</p><h2 className="geo-section-title mt-2">A remote-sensing assistant that stays accountable.</h2><p className="mt-4 text-sm leading-6 text-[#706f68]">GeoSaarthi maps the mandated SatQuery AI scope to an evidence-first product experience: single-image VQA plus scene understanding or grounding, bi-temporal change analysis, optical–SAR interpretation, agentic routing, confidence, provenance, and traceability.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Single optical / multispectral / SAR", "Bi-temporal change understanding", "Co-registered optical–SAR analysis", "Agentic specialist-workflow routing", "Evidence, confidence, and trace", "Interactive GUI and concise report"].map((item, index) => <div key={item} className="flex items-start gap-3 rounded-lg bg-[#f7f6f2] p-3"><span className="geo-serif text-lg text-[#355c7d]">0{index + 1}</span><span className="pt-1 text-xs font-semibold leading-4">{item}</span></div>)}</div></div><div className="geo-panel p-6"><p className="geo-kicker">Responsible AI boundary</p><h2 className="geo-section-title mt-2">Build the prototype. Do not exaggerate it.</h2><div className="mt-5 space-y-4">{[{ icon: ShieldCheck, label: "Evidence before eloquence", copy: "Every answer carries a visible result state, confidence signal, evidence reference, and execution trace." }, { icon: FileText, label: "Public benchmarks, transparent limits", copy: "BigEarthNet.txt, VRSBench, RSVQA, and CDVQA guide the demo. Hidden ISRO/SAC evaluation labels are never treated as training data." }, { icon: MapPinned, label: "Human review for consequential use", copy: "The system is an AI-assisted interpretation, not a certified operational decision for disaster, defence, or public safety." }].map((item) => <div key={item.label} className="flex gap-3 border-b border-[#eeeae1] pb-4 last:border-0"><item.icon className="mt-0.5 size-4 shrink-0 text-[#b86b3d]" /><div><p className="text-sm font-bold">{item.label}</p><p className="mt-1 text-xs leading-5 text-[#706f68]">{item.copy}</p></div></div>)}</div><a className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#355c7d] hover:text-[#294b68]" href="https://sih.gov.in/sih2026PS" target="_blank" rel="noreferrer">Read the official SIH problem statement <ArrowUpRight className="size-3.5" /></a></div></div></section>
        </div>
      </main>
    </div>
  );
}

function useAnalysisResultState() {
  return useState<{
    runId: string; mode: Mode; task: string; status: string; answer: string; confidence: number; confidenceLabel: string; confidenceNote: string; validation: { imageCount: number; pairCompatibility: string; warnings: string[]; rejections: string[] }; evidence: Array<{ id: string; title: string; summary: string; region: string; colour: string }>; selectedTools: Array<{ id: string; name: string }>; trace: Array<{ label: string; status: string; detail: string; elapsedMs: number }>; provenance: { source: string; modelBundle: string; retention: string; dataset: string }; reportMarkdown: string;
  } | null>(null);
}
