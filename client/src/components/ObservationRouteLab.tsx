import { Activity, ArrowRight, Check, Database, Layers3, MapPinned, Network, Orbit, Radar, Satellite, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";

const OPTICAL_IMAGE = "/manus-storage/geosaarthi-optical-terrain_12b5d412.png";
const SAR_IMAGE = "/manus-storage/geosaarthi-sar-radar_37a56f7b.png";
const CHANGE_IMAGE = "/manus-storage/geosaarthi-change-overlay_2f0bcd64.png";

const areas = [
  { id: "coast", title: "Coastal urban corridor", coords: "04°22′N · 02°10′E", x: "64%", y: "32%", note: "Optical scene · water / built-up / agriculture" },
  { id: "delta", title: "River delta watch", coords: "04°19′N · 02°02′E", x: "39%", y: "61%", note: "Grounding scene · water-body evidence" },
  { id: "growth", title: "East development belt", coords: "04°25′N · 02°17′E", x: "75%", y: "45%", note: "Bi-temporal pair · visible change" },
  { id: "flood", title: "Floodplain fusion sector", coords: "04°15′N · 02°08′E", x: "48%", y: "76%", note: "Optical + SAR pair · complementary evidence" },
];

const datasets = [
  { id: "optical", title: "Optical terrain benchmark", kind: "MULTISPECTRAL / DEMO", source: "Supplied local benchmark imagery", image: OPTICAL_IMAGE, date: "Declared sample context", provenance: "Visual benchmark layer used for interface demonstration; no acquisition claim is inferred from the product.", bands: "Rendered RGB preview" },
  { id: "sar", title: "SAR radar benchmark", kind: "SAR / DEMO", source: "Supplied local benchmark imagery", image: SAR_IMAGE, date: "Declared sample context", provenance: "Radar-texture reference included to teach cross-modal review; not a calibrated measurement product.", bands: "Single rendered intensity preview" },
  { id: "change", title: "Change overlay benchmark", kind: "EVIDENCE LAYER / DEMO", source: "Supplied local benchmark imagery", image: CHANGE_IMAGE, date: "Declared sample context", provenance: "Review overlay illustrates evidence linkage; it is not an operational change-alert feed.", bands: "Rendered change reference" },
];

const workflowNodes = [
  { id: "input", label: "Input", detail: "Declared assets and analyst question" },
  { id: "validate", label: "Validate", detail: "Image count, modality, and pair compatibility" },
  { id: "route", label: "Route", detail: "Task classifier selects a compatible workflow" },
  { id: "specialist", label: "Specialist", detail: "Scripted prototype adapter is identified" },
  { id: "evidence", label: "Evidence", detail: "Visible evidence reference is packaged" },
  { id: "artifact", label: "Artifact", detail: "Answer, confidence, provenance, trace, and report" },
];

function Panel({ title, eyebrow, copy, children }: { title: string; eyebrow: string; copy: string; children: React.ReactNode }) {
  return <section className="os-route-lab"><header><p><span /> {eyebrow}</p><h2>{title}</h2><span>{copy}</span></header>{children}</section>;
}

function EarthExplorerLab() {
  const [layer, setLayer] = useState<"optical" | "sar" | "change">("optical");
  const [areaId, setAreaId] = useState("coast");
  const area = areas.find((item) => item.id === areaId) ?? areas[0];
  const image = layer === "optical" ? OPTICAL_IMAGE : layer === "sar" ? SAR_IMAGE : CHANGE_IMAGE;
  return <Panel eyebrow="Area-of-interest explorer" title="Choose an Earth observation sector." copy="Layers and coverage are demonstration context for the supplied benchmark scenes—not a live mapping service."><div className="os-aoi-layout"><div className="os-aoi-map"><img src={image} alt={`${layer} benchmark layer for Earth exploration`} />{areas.map((item) => <button key={item.id} aria-label={`Select ${item.title}`} onClick={() => setAreaId(item.id)} className={item.id === area.id ? "is-selected" : ""} style={{ left: item.x, top: item.y }}><i /></button>)}<span>{layer.toUpperCase()} / BENCHMARK LAYER</span></div><div className="os-aoi-inspector"><div className="os-segmented">{(["optical", "sar", "change"] as const).map((item) => <button key={item} className={layer === item ? "is-selected" : ""} onClick={() => setLayer(item)}>{item}</button>)}</div><p>SELECTED SECTOR</p><b>{area.title}</b><span>{area.coords}</span><em>{area.note}</em><div className="os-coverage"><span><Satellite className="size-3.5" /> Optical context</span><span><Radar className="size-3.5" /> SAR context</span><span><Layers3 className="size-3.5" /> Evidence overlay</span></div></div></div></Panel>;
}

function SatelliteLab() {
  const passes = [
    { label: "Ascending pass", time: "Context T+00:00", geometry: "North-east heading", signal: "Illustrative nominal" },
    { label: "Radar geometry", time: "Context T+01:42", geometry: "Right-looking acquisition", signal: "Illustrative nominal" },
    { label: "Ground track", time: "Context T+03:18", geometry: "Benchmark sector crossing", signal: "Illustrative nominal" },
  ];
  const [passIndex, setPassIndex] = useState(0);
  const pass = passes[passIndex];
  return <Panel eyebrow="Orbit and pass context" title="Inspect a declared acquisition path." copy="Orbital and telemetry readouts are visual teaching context; GeoSaarthi is not connected to a live tracking feed."><div className="os-pass-layout"><div className="os-pass-map"><span className="os-pass-earth" /><span className="os-pass-orbit os-pass-orbit-a" /><span className="os-pass-orbit os-pass-orbit-b" /><span className="os-pass-track" /><span className="os-pass-sat"><Satellite className="size-4" /></span></div><div className="os-pass-list">{passes.map((item, index) => <button key={item.label} onClick={() => setPassIndex(index)} className={passIndex === index ? "is-selected" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.label}</b><ArrowRight className="size-4" /></button>)}</div><div className="os-pass-readout"><p>SELECTED DEMONSTRATION PASS</p><b>{pass.label}</b><span>{pass.time}</span><span>{pass.geometry}</span><em><Check className="size-3.5" /> {pass.signal}</em></div></div></Panel>;
}

function MonitorLab() {
  const [region, setRegion] = useState("Urban change");
  const [comparison, setComparison] = useState<"before" | "after" | "difference">("difference");
  const source = comparison === "before" ? OPTICAL_IMAGE : comparison === "after" ? SAR_IMAGE : CHANGE_IMAGE;
  const signals = ["Urban change", "Water extent", "Vegetation cue"];
  return <Panel eyebrow="Temporal monitoring desk" title="Compare a declared scene pair." copy="A detected cue remains a review object linked to supplied imagery; it is not a live alert or automatically verified change."><div className="os-monitor-layout"><div className="os-monitor-image"><img src={source} alt={`${comparison} monitoring view`} /><span>CHANGE CUE / REVIEW</span></div><div className="os-monitor-actions"><div className="os-segmented">{(["before", "after", "difference"] as const).map((item) => <button key={item} className={comparison === item ? "is-selected" : ""} onClick={() => setComparison(item)}>{item}</button>)}</div>{signals.map((item) => <button className={region === item ? "is-selected" : ""} onClick={() => setRegion(item)} key={item}><span><Activity className="size-3.5" /> {item}</span><em>{region === item ? "selected" : "review"}</em></button>)}<p><ShieldCheck className="size-4" /> {region} is staged for analyst inspection against the selected visual layer.</p></div></div></Panel>;
}

function AnalysesLab() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const recentRuns = trpc.geosaarthi.recentRuns.useQuery({ limit: 24 });
  const filtered = useMemo(() => (recentRuns.data ?? []).filter((run) => (filter === "all" || run.status === filter) && `${run.query} ${run.task}`.toLowerCase().includes(search.toLowerCase())), [filter, recentRuns.data, search]);
  return <Panel eyebrow="Saved work / metadata only" title="Return to an analysis record." copy="Saved work stores run metadata and review context—not raw image bytes. Use Replay to revisit a selected trace."><div className="os-archive-tools"><label><Search className="size-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search query or workflow" /></label><div className="os-segmented">{["all", "success", "rejected"].map((item) => <button key={item} className={filter === item ? "is-selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div>{recentRuns.isLoading ? <div className="os-data-state"><Activity className="size-4" /> Loading saved metadata…</div> : recentRuns.isError ? <div className="os-data-state is-error">Saved metadata could not be read in this session.</div> : filtered.length === 0 ? <div className="os-data-state"><Database className="size-4" /> No matching saved work. Execute a declared benchmark to create a local analysis record.</div> : <div className="os-archive-list">{filtered.map((run) => <button key={run.runId} onClick={() => setLocation(`/replay?runId=${encodeURIComponent(run.runId)}`)}><span>{run.status}</span><b>{run.query}</b><p>{run.task.replaceAll("_", " ")} · confidence {run.overallConfidence}</p><em>Open replay <ArrowRight className="size-3.5" /></em></button>)}</div>}</Panel>;
}

function DatasetLab() {
  const [datasetId, setDatasetId] = useState("optical");
  const dataset = datasets.find((item) => item.id === datasetId) ?? datasets[0];
  return <Panel eyebrow="Dataset and provenance explorer" title="Inspect the source context before analysis." copy="These are supplied demonstration assets. The metadata panel states their use within the interface rather than inventing sensor acquisition attributes."><div className="os-dataset-layout"><div className="os-dataset-list">{datasets.map((item) => <button key={item.id} className={item.id === dataset.id ? "is-selected" : ""} onClick={() => setDatasetId(item.id)}><span>{item.kind}</span><b>{item.title}</b><ArrowRight className="size-4" /></button>)}</div><figure><img src={dataset.image} alt={`${dataset.title} preview`} /><figcaption>{dataset.kind}</figcaption></figure><div className="os-dataset-meta"><p>DECLARED SOURCE</p><b>{dataset.source}</b><span>{dataset.date}</span><span>{dataset.bands}</span><em>{dataset.provenance}</em></div></div></Panel>;
}

function ModelsLab() {
  const registry = trpc.geosaarthi.modelRegistry.useQuery();
  const [modelId, setModelId] = useState("");
  const model = registry.data?.find((item) => item.id === modelId) ?? registry.data?.[0];
  return <Panel eyebrow="Declared specialist registry" title="Inspect the adapter before it is routed." copy="Registry records describe prototype adapters, accepted inputs, and limitations; they do not claim deployed production model performance.">{registry.isLoading ? <div className="os-data-state"><Activity className="size-4" /> Loading model registry…</div> : registry.isError || !model ? <div className="os-data-state is-error">The declared registry is unavailable.</div> : <div className="os-model-layout"><div className="os-model-list">{registry.data?.map((item) => <button key={item.id} className={item.id === model.id ? "is-selected" : ""} onClick={() => setModelId(item.id)}><CpuDot /><b>{item.name}</b><span>{item.version}</span></button>)}</div><article><p>ACCEPTED INPUT</p><h3>{model.name}</h3><span>{model.version} · {model.status}</span><dl><div><dt>Role</dt><dd>{model.tasks.join(", ")}</dd></div><div><dt>Input</dt><dd>{model.acceptedInputs}</dd></div><div><dt>Output</dt><dd>{model.output}</dd></div><div><dt>Performance</dt><dd>No benchmark-performance metric is recorded for this prototype adapter.</dd></div><div><dt>License</dt><dd>No external license claim is inferred from this registry descriptor.</dd></div><div><dt>Limit</dt><dd>{model.limitation}</dd></div></dl></article></div>}</Panel>;
}

function CpuDot() { return <span className="os-cpu-dot"><Network className="size-3.5" /></span>; }

function WorkflowLab() {
  const [nodeId, setNodeId] = useState("input");
  const node = workflowNodes.find((item) => item.id === nodeId) ?? workflowNodes[0];
  return <Panel eyebrow="Visible orchestration graph" title="Follow the data contract across the workflow." copy="The graph exposes structured hand-offs and data requirements while avoiding claims about private model chain-of-thought."><div className="os-workflow-layout"><div className="os-workflow-graph" aria-label="GeoSaarthi workflow graph">{workflowNodes.map((item, index) => <button key={item.id} className={item.id === node.id ? "is-selected" : ""} onClick={() => setNodeId(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.label}</b></button>)}</div><article><p>SELECTED CONTRACT NODE</p><h3>{node.label}</h3><span>{node.detail}</span><em><Network className="size-4" /> {nodeId === "input" ? "No hidden processing occurs before validation." : "This stage remains visible in the emitted trace."}</em></article></div></Panel>;
}

export function ObservationRouteLab({ routeId }: { routeId: string }) {
  if (routeId === "earth") return <EarthExplorerLab />;
  if (routeId === "satellites") return <SatelliteLab />;
  if (routeId === "monitor") return <MonitorLab />;
  if (routeId === "analyses") return <AnalysesLab />;
  if (routeId === "datasets") return <DatasetLab />;
  if (routeId === "models") return <ModelsLab />;
  if (routeId === "workflow") return <WorkflowLab />;
  return null;
}
