import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleAlert,
  Command,
  Compass,
  Cpu,
  Database,
  FileText,
  FlaskConical,
  Gauge,
  Globe2,
  HelpCircle,
  Layers3,
  MapPinned,
  Menu,
  Network,
  Orbit,
  Radar,
  Radio,
  RotateCcw,
  Satellite,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import "../operatingSystem.css";
import { operatingRouteById, operatingRoutes, type OperatingRoute } from "../lib/operatingSystem";
import { operatingRouteNeighbors } from "../lib/operatingSystemNavigation";
import { routeDetailFor } from "../lib/routeDetails";
import { trpc } from "../lib/trpc";
import { ObservationRouteLab } from "../components/ObservationRouteLab";
import { ProofRouteLab } from "../components/ProofRouteLab";
import { OperationsRouteLab } from "../components/OperationsRouteLab";

const OPTICAL_IMAGE = "/manus-storage/geosaarthi-optical-terrain_12b5d412.png";
const SAR_IMAGE = "/manus-storage/geosaarthi-sar-radar_37a56f7b.png";
const CHANGE_IMAGE = "/manus-storage/geosaarthi-change-overlay_2f0bcd64.png";

type RouteState = "ready" | "loading" | "success" | "error";

const routeIcons: Record<string, typeof Globe2> = {
  landing: Globe2, dashboard: Gauge, "new-analysis": Sparkles, workspace: BrainCircuit, earth: Compass,
  satellites: Satellite, monitor: Activity, analyses: FileText, datasets: Database, models: Cpu,
  workflow: Network, evidence: Search, spectral: Atom, fusion: Layers3, "time-machine": TimerReset,
  missions: Radar, benchmarks: FlaskConical, reports: FileText, alerts: AlertTriangle, observatory: BarChart3,
  learn: BookOpen, settings: Settings, help: HelpCircle, judge: ShieldCheck, replay: RotateCcw,
};

const sectionLabels = [
  { id: "observe", label: "Observe" }, { id: "analyze", label: "Analyze" }, { id: "prove", label: "Prove" },
  { id: "operate", label: "Operate" }, { id: "learn", label: "Learn" },
] as const;

const stageLabels = ["Input", "Validation", "Routing", "Model", "Evidence", "Answer", "Report"];

const visualDetails: Record<string, { tag: string; value: string; note: string; extra: string[] }> = {
  landing: { tag: "EARTH / CENTRAL OBJECT", value: "01", note: "A guided route from observation to defensible answer.", extra: ["Optical scene", "Evidence-first", "Bounded prototype"] },
  dashboard: { tag: "TODAY / MISSION SIGNAL", value: "04", note: "Four benchmark routes are staged for transparent demonstration.", extra: ["System ready", "Metadata only", "Human review"] },
  "new-analysis": { tag: "SELECT / OBSERVATION CONTRACT", value: "03", note: "The relationship between images decides the visible validation path.", extra: ["Single image", "Bi-temporal", "Optical + SAR"] },
  workspace: { tag: "ACTIVE / ANALYST CANVAS", value: "AI", note: "Query, image, tool route, evidence, and uncertainty stay together.", extra: ["Layer control", "Traceable route", "Review state"] },
  earth: { tag: "AOI / BENCHMARK SECTOR", value: "04", note: "Select a known scene before loading a compatible demonstration.", extra: ["Coastal", "Delta", "Floodplain"] },
  satellites: { tag: "ORBIT / SIMULATED PASS", value: "612", note: "Orbit displays are contextual teaching views, not a live tracking feed.", extra: ["Optical", "SAR", "Pass window"] },
  monitor: { tag: "MONITOR / TEMPORAL PAIR", value: "02", note: "A change cue is always tied back to a declared before and after scene.", extra: ["Urban", "Water", "Vegetation"] },
  analyses: { tag: "ARCHIVE / METADATA ONLY", value: "0", note: "Saved work stores mission metadata and trace references—not raw image bytes.", extra: ["Searchable", "Filterable", "Reopenable"] },
  datasets: { tag: "SOURCE / PROVENANCE", value: "03", note: "Every sample is framed by source, modality, and stated use in the prototype.", extra: ["Optical", "SAR", "Change labels"] },
  models: { tag: "REGISTRY / SPECIALISTS", value: "05", note: "Models are explained through accepted inputs, limits, and routing roles.", extra: ["VQA", "Grounding", "Fusion"] },
  workflow: { tag: "ORCHESTRATION / VISIBLE", value: "07", note: "The system shows its operational route without exposing unsupported hidden reasoning claims.", extra: ["Validate", "Select", "Package"] },
  evidence: { tag: "PROOF / INSPECTABLE", value: "02", note: "Detected regions are visual references linked to the analyst’s answer.", extra: ["Region", "Mask", "Source"] },
  spectral: { tag: "SPECTRAL / EDUCATIONAL", value: "BAND", note: "Wavelength concepts are shown as learning aids, not pixel-derived upload measurements.", extra: ["Visible", "NIR", "SWIR"] },
  fusion: { tag: "FUSION / DUAL SENSOR", value: "2×", note: "Optical and SAR views are compared as a scripted benchmark teaching scenario.", extra: ["Texture", "Backscatter", "Context"] },
  "time-machine": { tag: "TIME / TWO ACQUISITIONS", value: "2023–24", note: "Scrub a declared benchmark pair before reviewing the change view.", extra: ["Before", "After", "Difference"] },
  missions: { tag: "MISSION / SCENARIOS", value: "06", note: "Mission briefs frame an analyst question, evidence expectation, and prototype boundary.", extra: ["Flood", "Urban", "Coastal"] },
  benchmarks: { tag: "BENCHMARK / COVERAGE", value: "4/4", note: "Scripted coverage is distinct from recorded evaluation performance.", extra: ["VQA", "Grounding", "Change"] },
  reports: { tag: "ARTIFACT / FINAL", value: "PDF", note: "A report carries input metadata, answer, confidence, evidence, trace, and limitations.", extra: ["Preview", "Inspect", "Export"] },
  alerts: { tag: "QUEUE / ATTENTION", value: "03", note: "Alert states are prototype demonstration states, never operational notifications.", extra: ["Change", "System", "Model"] },
  observatory: { tag: "OBSERVE / THE SYSTEM", value: "LOCAL", note: "Only recorded run metadata is treated as observed; other health displays remain illustrative.", extra: ["Runs", "Storage", "Trace"] },
  learn: { tag: "LEARN / REMOTE SENSING", value: "04", note: "Short practical concepts explain the evidence route without replacing expert review.", extra: ["Optical", "SAR", "AI"] },
  settings: { tag: "PREFERENCES / LOCAL", value: "A11Y", note: "Display and accessibility controls apply locally within the bounded workspace.", extra: ["Appearance", "Motion", "Retention"] },
  help: { tag: "GUIDE / ROUTE MAP", value: "25", note: "Documentation follows the same observation-to-artifact structure as the product.", extra: ["Tutorial", "Shortcuts", "Workflow"] },
  judge: { tag: "SIH / PROOF ROUTE", value: "05", note: "A guided demonstration presents the workflow, evidence, uncertainty, and report boundary.", extra: ["Mission", "Trace", "Artifact"] },
  replay: { tag: "REPLAY / ORDERED TRACE", value: "07", note: "Replay returns to available metadata and scripted execution events in sequence.", extra: ["Input", "Evidence", "Report"] },
};

function stateCopy(state: RouteState) {
  if (state === "loading") return { label: "Working", copy: "Preparing the route with visible system stages.", icon: Activity, tone: "blue" };
  if (state === "success") return { label: "Ready to inspect", copy: "The bounded prototype state is available for analyst review.", icon: Check, tone: "good" };
  if (state === "error") return { label: "Review required", copy: "The request is intentionally held until input or evidence conditions are clarified.", icon: CircleAlert, tone: "warn" };
  return { label: "Standing by", copy: "Choose an interaction to expose this page’s bounded prototype state.", icon: Radio, tone: "muted" };
}

function OrbitalEarth({ compact = false }: { compact?: boolean }) {
  return <div className={`os-orbital ${compact ? "os-orbital-compact" : ""}`} aria-label="Cinematic Earth observation illustration">
    <span className="os-orbit os-orbit-a" /><span className="os-orbit os-orbit-b" /><span className="os-orbit os-orbit-c" />
    <span className="gs-earth-satellite"><Satellite className="size-3.5" /></span>
    <div className="os-earth"><img src={OPTICAL_IMAGE} alt="Supplied optical benchmark landscape" /></div>
    <span className="os-acquisition">ACQUIRING / DEMO</span>
  </div>;
}

function SceneShell({ route, children }: { route: OperatingRoute; children: ReactNode }) {
  const detail = visualDetails[route.id];
  return <div className={`os-scene os-${route.visualMode}`} data-mode={route.visualMode}>
    <div className="os-scene-top"><span className="os-scene-tag">{detail.tag}</span><span className="os-scene-value">{detail.value}</span></div>
    {children}
    <p className="os-scene-note">{detail.note}</p>
    <div className="os-scene-foot">{detail.extra.map((item) => <span key={item}>{item}</span>)}</div>
  </div>;
}

function ImageScene({ route, layer, setLayer, position, setPosition }: { route: OperatingRoute; layer: "optical" | "sar" | "change"; setLayer: (layer: "optical" | "sar" | "change") => void; position: number; setPosition: (value: number) => void }) {
  const source = layer === "optical" ? OPTICAL_IMAGE : layer === "sar" ? SAR_IMAGE : CHANGE_IMAGE;
  return <SceneShell route={route}><div className="os-imagery"><img src={source} alt={`${layer} benchmark view`} /><span className="os-grid" /><span className="os-evidence-box" style={{ left: `${position}%` }}><i /> <b>Evidence zone</b></span><span className="os-imagery-label">{layer.toUpperCase()} / BENCHMARK VIEW</span></div><div className="os-layer-row">{(["optical", "sar", "change"] as const).map((item) => <button key={item} className={layer === item ? "is-active" : ""} onClick={() => setLayer(item)}>{item}</button>)}<label>Focus<input aria-label="Evidence focus" type="range" min="15" max="72" value={position} onChange={(event) => setPosition(Number(event.target.value))} /></label></div></SceneShell>;
}

function ProcessScene({ route, selectedStage, setSelectedStage }: { route: OperatingRoute; selectedStage: number; setSelectedStage: (value: number) => void }) {
  const stages = route.id === "judge" ? ["Brief", "Load", "Route", "Prove", "Report"] : route.id === "replay" ? stageLabels : ["Input", "Validate", "Select", "Reason", "Evidence", "Answer"];
  return <SceneShell route={route}><div className="os-process">{stages.map((stage, index) => <button key={stage} onClick={() => setSelectedStage(index)} className={selectedStage === index ? "is-active" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{stage}</b></button>)}</div><div className="os-process-readout"><Network className="size-4" /><span><b>{stages[selectedStage] ?? stages[0]}</b> / inspected node</span><ChevronRight className="ml-auto size-4" /></div></SceneShell>;
}

function SignalScene({ route, state }: { route: OperatingRoute; state: RouteState }) {
  const detail = visualDetails[route.id];
  const bars = route.id === "spectral" ? [35, 58, 82, 64, 45, 73, 51, 91, 47, 38] : [61, 44, 75, 50, 84, 65, 35, 71, 55, 89];
  return <SceneShell route={route}><div className="os-signals">{bars.map((height, index) => <i key={`${height}-${index}`} style={{ height: `${height}%`, animationDelay: `${index * 75}ms` }} />)}</div><div className="os-signal-caption"><span><i className={`os-indicator ${state === "error" ? "is-warn" : ""}`} /> {state === "success" ? "Reviewed state" : "Visual signal field"}</span><span>{detail.extra[0]} · {detail.extra[1]}</span></div></SceneShell>;
}

function RegistryScene({ route, onAction }: { route: OperatingRoute; onAction: () => void }) {
  const labels = route.id === "alerts" ? ["Change cue / review", "System state / nominal", "Model boundary / visible"] : route.id === "learn" ? ["Optical imagery", "SAR interpretation", "Evidence-first AI"] : route.id === "settings" ? ["High contrast", "Reduced motion", "Metadata retention"] : route.id === "help" ? ["Guided demo", "Keyboard commands", "Workflow contract"] : route.id === "missions" ? ["Floodplain fusion", "Urban change", "Coastal observation"] : route.id === "datasets" ? ["Optical terrain", "SAR texture", "Change overlay"] : route.id === "models" ? ["Vision question", "Scene grounding", "Change specialist"] : ["Latest mission", "Evidence package", "Review artifact"];
  return <SceneShell route={route}><div className="os-ledger">{labels.map((label, index) => <button key={label} onClick={onAction}><span>{String(index + 1).padStart(2, "0")}</span><b>{label}</b><i className={index === 0 ? "is-blue" : index === 1 ? "is-good" : "is-warn"} /><ChevronRight className="size-4" /></button>)}</div><button className="os-ledger-action" onClick={onAction}>Inspect selected record <ArrowRight className="size-4" /></button></SceneShell>;
}

function OrbitScene({ route, selectedStage, setSelectedStage }: { route: OperatingRoute; selectedStage: number; setSelectedStage: (value: number) => void }) {
  const passes = ["Ascending pass", "Radar geometry", "Ground track", "Acquisition window"];
  return <SceneShell route={route}><div className="os-orbit-field"><span className="os-ground-track" />{passes.map((pass, index) => <button key={pass} onClick={() => setSelectedStage(index)} className={`gs-orbit-pass gs-orbit-pass-${index} ${selectedStage === index ? "is-active" : ""}`}><Satellite className="size-3.5" /><span>{pass}</span></button>)}</div><div className="os-orbit-readout"><span>GS-DEMO-01 / SIMULATED</span><b>{passes[selectedStage] ?? passes[0]}</b><span>612 km context</span></div></SceneShell>;
}

function DashboardScene({ route, state, onAction }: { route: OperatingRoute; state: RouteState; onAction: () => void }) {
  const metrics = route.id === "observatory" ? [["Routes", "25"], ["Modes", "3"], ["Runs", "local"], ["Storage", "meta"]] : [["Mission paths", "4"], ["Input modes", "3"], ["Specialists", "5"], ["Trace", "100%"]];
  return <SceneShell route={route}><div className="os-metrics">{metrics.map(([label, value]) => <button key={label} onClick={onAction}><b>{value}</b><span>{label}</span></button>)}</div><div className="os-dashboard-stream"><span>AI QUERY / ready for analyst input</span><i className={state === "loading" ? "is-running" : ""} /><span>{state === "success" ? "Evidence package available" : "Bounded system status"}</span></div></SceneShell>;
}

function VisualCenterpiece({ route, state, selectedStage, setSelectedStage, layer, setLayer, position, setPosition, onAction }: { route: OperatingRoute; state: RouteState; selectedStage: number; setSelectedStage: (value: number) => void; layer: "optical" | "sar" | "change"; setLayer: (layer: "optical" | "sar" | "change") => void; position: number; setPosition: (value: number) => void; onAction: () => void }) {
  if (route.visualMode === "earth" || route.visualMode === "explorer") return <SceneShell route={route}><OrbitalEarth /><button className="os-orbit-launch" onClick={onAction}>Select observation route <ArrowRight className="size-4" /></button></SceneShell>;
  if (["workspace", "evidence", "fusion", "timeline", "monitor"].includes(route.visualMode)) return <ImageScene route={route} layer={layer} setLayer={setLayer} position={position} setPosition={setPosition} />;
  if (["analysis", "workflow", "judge", "replay"].includes(route.visualMode)) return <ProcessScene route={route} selectedStage={selectedStage} setSelectedStage={setSelectedStage} />;
  if (["satellite"].includes(route.visualMode)) return <OrbitScene route={route} selectedStage={selectedStage} setSelectedStage={setSelectedStage} />;
  if (["dashboard", "observatory"].includes(route.visualMode)) return <DashboardScene route={route} state={state} onAction={onAction} />;
  if (route.visualMode === "spectral") return <SignalScene route={route} state={state} />;
  return <RegistryScene route={route} onAction={onAction} />;
}

function StateCard({ state, onRun, onError }: { state: RouteState; onRun: () => void; onError: () => void }) {
  const current = stateCopy(state);
  const Icon = current.icon;
  return <aside className={`os-state os-state-${current.tone}`} aria-live="polite"><div className="os-state-head"><span className="os-state-icon"><Icon className="size-4" /></span><div><p>{current.label}</p><span>{current.copy}</span></div></div><div className="os-state-actions"><button onClick={onRun} disabled={state === "loading"}>{state === "loading" ? "Processing route" : "Reveal state"}</button><button onClick={onError}>Show review case</button></div></aside>;
}

function GroundedDataPanel({ route }: { route: OperatingRoute }) {
  const showsRuns = ["dashboard", "analyses", "reports", "observatory"].includes(route.id);
  const showsModels = route.id === "models";
  const showsDemos = ["missions", "benchmarks", "judge"].includes(route.id);
  const [selectedRunId, setSelectedRunId] = useState(() => new URLSearchParams(window.location.search).get("runId") ?? "");
  const recentRuns = trpc.geosaarthi.recentRuns.useQuery({ limit: 3 }, { enabled: showsRuns });
  const registry = trpc.geosaarthi.modelRegistry.useQuery(undefined, { enabled: showsModels });
  const demos = trpc.geosaarthi.demoCases.useQuery(undefined, { enabled: showsDemos });
  const report = trpc.geosaarthi.exportReport.useQuery({ runId: selectedRunId || "pending" }, { enabled: route.id === "reports" && Boolean(selectedRunId) });
  useEffect(() => { if (route.id !== "reports") setSelectedRunId(""); }, [route.id]);
  useEffect(() => { if (route.id === "reports" && !selectedRunId && recentRuns.data?.[0]) setSelectedRunId(recentRuns.data[0].runId); }, [recentRuns.data, route.id, selectedRunId]);
  if (!showsRuns && !showsModels && !showsDemos) return null;

  const dataQuery = showsRuns ? recentRuns : showsModels ? registry : demos;
  const heading = showsRuns ? "Recorded analysis metadata" : showsModels ? "Declared specialist registry" : "Scripted benchmark missions";
  const boundary = showsRuns ? "Runs display persisted metadata only; raw image bytes are not stored in the database." : showsModels ? "Registry entries describe prototype adapters and their declared limitations." : "These missions are scripted demonstrations—not live satellite operations or measured production results.";
  const items = dataQuery.data ?? [];
  function downloadReport() { if (!report.data) return; const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([report.data.content], { type: "text/markdown" })); link.download = report.data.fileName; link.click(); URL.revokeObjectURL(link.href); }
  return <section className="os-grounded" aria-label={heading}><header><p className="os-kicker"><span /> Grounded system record</p><h2>{heading}</h2><p>{boundary}</p></header>{dataQuery.isLoading ? <div className="os-data-state"><Activity className="size-4" /> Loading typed prototype metadata…</div> : dataQuery.isError ? <div className="os-data-state is-error"><CircleAlert className="size-4" /> Metadata is unavailable for this view. Use the review state to inspect the boundary.</div> : items.length === 0 ? <div className="os-data-state"><Database className="size-4" /> No saved records are available yet. Run a bounded benchmark to create metadata.</div> : <div className="os-data-list">{showsRuns ? recentRuns.data?.map((run) => <button type="button" key={run.runId} className={selectedRunId === run.runId ? "is-selected" : ""} onClick={() => setSelectedRunId(run.runId)}><span>{run.status}</span><b>{run.query}</b><p>{run.task.replaceAll("_", " ")} · confidence {run.overallConfidence}</p><em>{run.runId}</em></button>) : showsModels ? registry.data?.slice(0, 3).map((model) => <article key={model.id}><span>{model.status}</span><b>{model.name}</b><p>{model.acceptedInputs}</p><em>{model.version}</em></article>) : demos.data?.slice(0, 3).map((demo) => <article key={demo.id}><span>{demo.workflow}</span><b>{demo.title}</b><p>{demo.subtitle}</p><em>{demo.mode.replaceAll("_", " ")}</em></article>)}</div>}{route.id === "reports" && selectedRunId ? <div className="os-report-preview">{report.isLoading ? <p><Activity className="size-4" /> Assembling the selected report artifact…</p> : report.isError || !report.data ? <p className="is-error"><CircleAlert className="size-4" /> The selected record has no exportable artifact.</p> : <><div><span>REPORT PREVIEW / {report.data.fileName}</span><button onClick={downloadReport}>Download Markdown <ArrowDownToLine className="size-4" /></button></div><pre>{report.data.content.slice(0, 900)}{report.data.content.length > 900 ? "\n…" : ""}</pre></>}</div> : null}</section>;
}

function WorkspaceConsole() {
  const [selectedDemoId, setSelectedDemoId] = useState("");
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const demos = trpc.geosaarthi.demoCases.useQuery();
  const activeDemo = demos.data?.find((demo) => demo.id === selectedDemoId) ?? demos.data?.[0];
  const input = useMemo(() => activeDemo ? { mode: activeDemo.mode, query: workspaceQuery || activeDemo.query, assets: activeDemo.assets } : { mode: "single" as const, query: "", assets: [] }, [activeDemo, workspaceQuery]);
  const preview = trpc.geosaarthi.previewAnalysis.useQuery(input, { enabled: Boolean(activeDemo) });
  const utils = trpc.useUtils();
  const execute = trpc.geosaarthi.executeAnalysis.useMutation({ onSuccess: () => { utils.geosaarthi.recentRuns.invalidate(); } });
  useEffect(() => { if (demos.data?.[0] && !selectedDemoId) setSelectedDemoId(demos.data[0].id); }, [demos.data, selectedDemoId]);
  useEffect(() => { if (activeDemo && !workspaceQuery) setWorkspaceQuery(activeDemo.query); }, [activeDemo, workspaceQuery]);
  const validation = preview.data?.validation;
  const canExecute = Boolean(activeDemo) && !preview.isLoading && !validation?.rejections.length && !execute.isPending;

  return <section className="os-workspace-console" aria-label="Typed GeoSaarthi analysis workspace"><header><p className="os-kicker"><span /> Connected analysis contract</p><h2>From declared input to visible evidence.</h2><p>Run a supplied benchmark through the existing typed validation, routing, execution, trace, and metadata-only persistence flow. No raw image bytes are sent to the database.</p></header>{demos.isLoading ? <div className="os-data-state"><Activity className="size-4" /> Loading analysis contracts…</div> : demos.isError || !activeDemo ? <div className="os-data-state is-error"><CircleAlert className="size-4" /> Benchmark inputs are unavailable. The workspace is intentionally not executing without a declared input contract.</div> : <div className="os-workspace-grid"><div className="os-demo-picker" role="list" aria-label="Select analysis mode">{demos.data?.map((demo) => <button type="button" role="listitem" key={demo.id} onClick={() => { setSelectedDemoId(demo.id); setWorkspaceQuery(demo.query); }} className={activeDemo.id === demo.id ? "is-selected" : ""}><span>{demo.mode.replaceAll("_", " ")}</span><b>{demo.workflow}</b><em>{demo.title}</em></button>)}</div><div className="os-query-panel"><label htmlFor="workspace-query">Analyst query</label><textarea id="workspace-query" value={workspaceQuery} onChange={(event) => setWorkspaceQuery(event.target.value)} /><div><span>{activeDemo.assets.length} declared asset{activeDemo.assets.length === 1 ? "" : "s"} · {activeDemo.mode.replaceAll("_", " ")}</span><button onClick={() => execute.mutate(input)} disabled={!canExecute}>{execute.isPending ? "Executing visible route…" : "Execute analysis"} <Zap className="size-3.5" /></button></div></div><aside className="os-validation-panel" aria-live="polite"><span>{preview.isLoading ? "VALIDATING" : preview.isError ? "VALIDATION UNAVAILABLE" : validation?.rejections.length ? "HELD FOR REVIEW" : "VALIDATED CONTRACT"}</span>{preview.isLoading ? <p>Checking the query and declared asset relationship…</p> : preview.isError ? <p>Unable to preview this input; execution remains unavailable until validation can be read.</p> : <><b>{preview.data?.task.replaceAll("_", " ")}</b><p>{validation?.rejections.length ? validation.rejections[0] : validation?.warnings[0] ?? "Input relationship accepted for the scripted prototype route."}</p><em>{validation?.pairCompatibility}</em></>}</aside></div>}{execute.isError ? <div className="os-data-state is-error"><CircleAlert className="size-4" /> The analysis route did not complete. Review the declared input and try again.</div> : null}{execute.data ? <div className="os-execution-result"><div><span>ANSWER / SCRIPTED PROTOTYPE ADAPTER</span><b>{execute.data.answer}</b><p>{execute.data.confidenceLabel} confidence · {execute.data.confidenceNote}</p></div><ol>{execute.data.trace.map((step) => <li key={step.label}><span>{step.status}</span><b>{step.label}</b><em>{step.detail}</em></li>)}</ol></div> : null}</section>;
}

export default function OperatingSystemPage({ routeId }: { routeId: string }) {
  const route = operatingRouteById[routeId] ?? operatingRouteById.landing;
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<RouteState>("ready");
  const [selectedStage, setSelectedStage] = useState(0);
  const [layer, setLayer] = useState<"optical" | "sar" | "change">("optical");
  const [position, setPosition] = useState(48);
  const [highContrast, setHighContrast] = useState(false);
  const [manualMotionReduce, setManualMotionReduce] = useState(() => new URLSearchParams(window.location.search).get("motion") === "reduce");

  const { previous: previousRoute, next: nextRoute } = operatingRouteNeighbors(route.id);
  const routeDetails = routeDetailFor(route.id);
  const filteredRoutes = useMemo(() => operatingRoutes.filter((item) => `${item.label} ${item.title} ${item.section}`.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => { setState("ready"); setSelectedStage(0); setMobileOpen(false); }, [route.id]);
  useEffect(() => {
    if (state !== "loading") return;
    const timer = window.setTimeout(() => setState("success"), 1200);
    return () => window.clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen((open) => !open); }
      if (event.key === "Escape") { setPaletteOpen(false); setMobileOpen(false); }
      if (event.altKey && event.key === "ArrowRight") setLocation(nextRoute.path);
      if (event.altKey && event.key === "ArrowLeft") setLocation(previousRoute.path);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextRoute.path, previousRoute.path, setLocation]);

  function runState() { setState("loading"); }
  function showReview() { setState("error"); }
  function selectRouteControl(index: number) {
    setSelectedStage(index);
    if (route.id === "settings" && index === 0) setHighContrast((enabled) => !enabled);
    if (route.id === "settings" && index === 2) setManualMotionReduce((enabled) => !enabled);
    setState("loading");
  }
  function followPrimary() {
    if (route.id === "landing") { setLocation("/dashboard"); return; }
    if (route.id === "dashboard") { setLocation("/new-analysis"); return; }
    if (route.id === "new-analysis") { setLocation("/workspace"); return; }
    if (route.id === "workspace") { setLocation("/evidence"); return; }
    setState("loading");
  }

  return <div className={`os-app os-route-${route.id} ${highContrast ? "os-high-contrast" : ""} ${manualMotionReduce ? "os-manual-reduced" : ""}`}>
    <a className="os-skip" href="#main-content">Skip to page content</a>
    <aside className="os-sidebar" aria-label="GeoSaarthi operating system navigation"><div className="os-brand"><Link href="/"><span className="os-brand-mark"><Orbit className="size-5" /></span></Link><div><b>GeoSaarthi</b><span>EARTH INTELLIGENCE</span></div></div><button className="os-command" onClick={() => setPaletteOpen(true)}><Command className="size-4" /><span>Find a surface</span><kbd>⌘ K</kbd></button><nav>{sectionLabels.map((section) => <div className="os-nav-group" key={section.id}><p>{section.label}</p>{operatingRoutes.filter((item) => item.section === section.id).map((item) => { const Icon = routeIcons[item.id]; return <Link key={item.id} href={item.path} className={item.id === route.id ? "is-active" : ""}><Icon className="size-4" /><span>{item.label}</span><em>{item.number}</em></Link>; })}</div>)}</nav><div className="os-sidebar-foot"><span><i /> PROTOTYPE / BOUNDED</span><p>Evidence before eloquence</p></div></aside>
    <header className="os-topbar"><button onClick={() => setMobileOpen((open) => !open)} className="os-mobile-menu" aria-label="Open navigation">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button><div className="os-crumb"><span>{route.number}</span><p>{route.label}</p><ChevronRight className="size-3.5" /><b>{route.eyebrow}</b></div><div className="os-top-actions"><button onClick={() => setPaletteOpen(true)} aria-label="Open route search"><Search className="size-4" /></button><span><i /> {manualMotionReduce ? "MOTION / REDUCED" : "DEMO / READY"}</span></div></header>
    {mobileOpen ? <nav className="os-mobile-nav" aria-label="Mobile GeoSaarthi navigation">{operatingRoutes.map((item) => { const Icon = routeIcons[item.id]; return <Link key={item.id} href={item.path}><Icon className="size-4" /><span>{item.number} / {item.label}</span><ChevronRight className="ml-auto size-4" /></Link>; })}</nav> : null}
    <main id="main-content" className="os-main" key={route.id}>
      <section className="os-page-hero"><div className="os-hero-copy"><p className="os-kicker"><span /> {route.eyebrow}</p><h1>{route.title}</h1><p>{route.description}</p><div className="os-hero-actions"><button className="os-primary" onClick={followPrimary}>{route.id === "landing" ? "Enter command center" : route.interaction}<ArrowRight className="size-4" /></button><button className="os-secondary" onClick={() => setPaletteOpen(true)}>Explore routes <Command className="size-4" /></button></div><p className="os-boundary"><ShieldCheck className="size-4" /> {route.boundary}</p></div><VisualCenterpiece route={route} state={state} selectedStage={selectedStage} setSelectedStage={setSelectedStage} layer={layer} setLayer={setLayer} position={position} setPosition={setPosition} onAction={followPrimary} /></section>
      {route.id === "workspace" ? <WorkspaceConsole /> : null}
      <ObservationRouteLab routeId={route.id} />
      <ProofRouteLab routeId={route.id} />
      <OperationsRouteLab routeId={route.id} highContrast={highContrast} manualMotionReduce={manualMotionReduce} onContrast={() => setHighContrast((enabled) => !enabled)} onMotion={() => setManualMotionReduce((enabled) => !enabled)} />
      <section className="os-route-controls" aria-label={`${route.label} analyst controls`}>{routeDetails.map((detail, index) => <button key={detail.label} className={selectedStage === index ? "is-selected" : ""} onClick={() => selectRouteControl(index)}><span>{String(index + 1).padStart(2, "0")} / {detail.label}</span><h2>{detail.title}</h2><p>{detail.copy}</p><b>{detail.action} <ArrowRight className="size-3.5" /></b></button>)}</section>
      <GroundedDataPanel route={route} />
      <section className="os-inspection-grid"><article className="os-inspection-card"><p className="os-kicker"><span /> Primary interaction</p><h2>{route.interaction}</h2><p>Inspect the page’s declared analyst controls to expose its route-specific state. The adjacent panel keeps ready, loading, success, and review-required conditions explicit without concealing the prototype boundary.</p><div className="os-route-links"><Link href={previousRoute.path}><ArrowLeft className="size-4" /> {previousRoute.number} / {previousRoute.label}</Link><Link href={nextRoute.path}>{nextRoute.number} / {nextRoute.label} <ArrowRight className="size-4" /></Link></div></article><StateCard state={state} onRun={runState} onError={showReview} /></section>
      <section className="os-proof-ribbon"><div><span>EARTH</span><Globe2 className="size-4" /></div><i /><div><span>SATELLITE</span><Satellite className="size-4" /></div><i /><div><span>AI</span><BrainCircuit className="size-4" /></div><i /><div><span>EVIDENCE</span><Search className="size-4" /></div><i /><div><span>TRACE</span><Network className="size-4" /></div><i /><div><span>REPORT</span><FileText className="size-4" /></div></section>
    </main>
    {paletteOpen ? <div className="os-palette-backdrop" role="presentation" onMouseDown={() => setPaletteOpen(false)}><section role="dialog" aria-modal="true" aria-label="GeoSaarthi route finder" className="os-palette" onMouseDown={(event) => event.stopPropagation()}><div className="os-palette-input"><Search className="size-4" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an Earth Intelligence surface…" /><kbd>ESC</kbd></div><div className="os-palette-list">{filteredRoutes.map((item) => { const Icon = routeIcons[item.id]; return <Link key={item.id} href={item.path} onClick={() => setPaletteOpen(false)}><span className="os-palette-number">{item.number}</span><Icon className="size-4" /><span><b>{item.label}</b><em>{item.centerpiece}</em></span><ChevronRight className="ml-auto size-4" /></Link>; })}</div><p>Use Alt + ← or → to move through the operating system route by route.</p></section></div> : null}
  </div>;
}
