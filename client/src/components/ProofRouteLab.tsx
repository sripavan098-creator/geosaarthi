import { Activity, ArrowRight, Check, CircleAlert, FileText, Layers3, Play, Radar, Search, ShieldCheck, SlidersHorizontal, TimerReset, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "../lib/trpc";

const OPTICAL_IMAGE = "/manus-storage/geosaarthi-optical-terrain_12b5d412.png";
const SAR_IMAGE = "/manus-storage/geosaarthi-sar-radar_37a56f7b.png";
const CHANGE_IMAGE = "/manus-storage/geosaarthi-change-overlay_2f0bcd64.png";

function Panel({ title, eyebrow, copy, children }: { title: string; eyebrow: string; copy: string; children: React.ReactNode }) {
  return <section className="os-route-lab os-proof-lab"><header><p><span /> {eyebrow}</p><h2>{title}</h2><span>{copy}</span></header>{children}</section>;
}

function EvidenceLab() {
  const regions = [
    { id: "water", label: "Water-body reference", image: OPTICAL_IMAGE, note: "Visible water context is highlighted for analyst review." },
    { id: "change", label: "Change-cue reference", image: CHANGE_IMAGE, note: "Supplied overlay provides a spatial cue, not a verified operational alert." },
    { id: "radar", label: "Radar-texture reference", image: SAR_IMAGE, note: "SAR texture is presented as complementary contextual evidence." },
  ];
  const [regionId, setRegionId] = useState("water");
  const [showGrid, setShowGrid] = useState(true);
  const active = regions.find((region) => region.id === regionId) ?? regions[0];
  return <Panel eyebrow="Evidence relationship canvas" title="Pin a claim to an inspectable visual reference." copy="Evidence regions are supplied demonstration references. They assist review, not substitute for validation by a qualified analyst."><div className="os-evidence-lab"><div className={`os-evidence-image ${showGrid ? "has-grid" : ""}`}><img src={active.image} alt={`${active.label} evidence reference`} /><span className="os-evidence-region"><i /> {active.label}</span></div><div className="os-evidence-controls">{regions.map((region) => <button key={region.id} onClick={() => setRegionId(region.id)} className={active.id === region.id ? "is-selected" : ""}><Search className="size-3.5" /><span>{region.label}</span><ArrowRight className="size-3.5" /></button>)}<button onClick={() => setShowGrid((value) => !value)}><SlidersHorizontal className="size-3.5" /> {showGrid ? "Hide review grid" : "Show review grid"}</button><p><ShieldCheck className="size-4" /> {active.note}</p></div></div></Panel>;
}

function SpectralLab() {
  const bands = [
    { id: "blue", label: "Blue", range: "Visible spectrum", note: "Useful concept for water and atmospheric visual context." },
    { id: "red", label: "Red", range: "Visible spectrum", note: "Useful concept for vegetation contrast in a natural-color scene." },
    { id: "nir", label: "Near infrared", range: "Near infrared", note: "Useful concept for interpreting vegetation response." },
    { id: "swir", label: "Short-wave infrared", range: "Short-wave infrared", note: "Useful concept for moisture and surface-material context." },
  ];
  const [bandId, setBandId] = useState("nir");
  const [pixel, setPixel] = useState("A-04");
  const active = bands.find((band) => band.id === bandId) ?? bands[0];
  return <Panel eyebrow="Educational spectral inspector" title="Explore spectral reasoning without inventing measurements." copy="Band descriptions and the visual curve are educational aids; neither represents calibrated values derived from an uploaded or live satellite scene."><div className="os-spectral-lab"><div className="os-band-selector">{bands.map((band, index) => <button key={band.id} className={band.id === active.id ? "is-selected" : ""} onClick={() => setBandId(band.id)}><span>{String(index + 1).padStart(2, "0")}</span><b>{band.label}</b><em>{band.range}</em></button>)}</div><div className="os-spectral-curve"><div className="os-curve-line"><i /><i /><i /><i /><i /><i /><i /></div><span>ILLUSTRATIVE NORMALIZED RESPONSE / NOT PIXEL-DERIVED</span></div><div className="os-pixel-inspector"><p>LEARNING PIXEL</p><button onClick={() => setPixel(pixel === "A-04" ? "C-11" : "A-04")}><Radar className="size-4" /> Select conceptual pixel: {pixel}</button><b>{active.label}</b><span>{active.note}</span><em>Interpretation begins with sensor, acquisition, and validation context.</em></div></div></Panel>;
}

function ComparisonLab({ kind }: { kind: "fusion" | "time" }) {
  const [divider, setDivider] = useState(kind === "fusion" ? 54 : 48);
  const [showDifference, setShowDifference] = useState(false);
  const leftTitle = kind === "fusion" ? "Optical context" : "Before / declared benchmark";
  const rightTitle = kind === "fusion" ? "SAR texture" : "After / declared benchmark";
  const rightImage = kind === "fusion" ? SAR_IMAGE : CHANGE_IMAGE;
  return <Panel eyebrow={kind === "fusion" ? "Dual-modality comparator" : "Bi-temporal comparison rail"} title={kind === "fusion" ? "Move across complementary sensor context." : "Scrub a declared before-and-after pair."} copy={kind === "fusion" ? "The slider compares supplied optical and SAR demonstration imagery. It supports visual reasoning but is not a calibrated sensor-fusion output." : "The slider compares declared benchmark layers. Difference mode is a supplied evidence reference, not an independently validated change product."}><div className="os-compare-lab"><div className="os-compare-view"><img src={OPTICAL_IMAGE} alt={leftTitle} /><img className="os-compare-right" src={showDifference && kind === "time" ? CHANGE_IMAGE : rightImage} alt={rightTitle} style={{ clipPath: `inset(0 0 0 ${divider}%)` }} /><span className="os-compare-line" style={{ left: `${divider}%` }}><i /></span><b className="os-compare-left-label">{leftTitle}</b><b className="os-compare-right-label">{showDifference && kind === "time" ? "Difference cue" : rightTitle}</b></div><div className="os-compare-controls"><label htmlFor={`${kind}-comparison-divider`}>Comparison divider <input id={`${kind}-comparison-divider`} type="range" min="12" max="88" value={divider} onChange={(event) => setDivider(Number(event.target.value))} /></label>{kind === "time" ? <button onClick={() => setShowDifference((value) => !value)} className={showDifference ? "is-selected" : ""}><TimerReset className="size-4" /> {showDifference ? "Return to after view" : "Show difference cue"}</button> : <span><Layers3 className="size-4" /> Optical and SAR remain distinct sources in this comparison.</span>}</div></div></Panel>;
}

function MissionLab() {
  const missions = [
    { id: "flood", title: "Flood", method: "Optical–SAR fusion", question: "Where do complementary optical and radar cues support flood review?" },
    { id: "urban", title: "Urban", method: "Bi-temporal change", question: "What visible development cues changed between the declared pair?" },
    { id: "forest", title: "Forest", method: "Optical scene review", question: "Which land-cover cues merit forest-condition inspection?" },
    { id: "coastal", title: "Coastal", method: "Grounding reference", question: "Where is the coastal feature relationship visible in this benchmark scene?" },
    { id: "agriculture", title: "Agriculture", method: "Spectral learning", question: "Which band concepts may help explain vegetation contrast?" },
    { id: "disaster", title: "Disaster", method: "Evidence-first route", question: "Which observation, evidence, and review steps should precede a conclusion?" },
  ];
  const [missionId, setMissionId] = useState("flood");
  const mission = missions.find((item) => item.id === missionId) ?? missions[0];
  return <Panel eyebrow="Mission scenario library" title="Frame the question before choosing the tool." copy="Mission cards are SIH prototype scenarios. They describe the applicable route; they do not issue operational recommendations or real-world alerts."><div className="os-mission-lab"><div className="os-mission-grid">{missions.map((item, index) => <button key={item.id} onClick={() => setMissionId(item.id)} className={item.id === mission.id ? "is-selected" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.title}</b><em>{item.method}</em></button>)}</div><article><p>SELECTED MISSION BRIEF</p><h3>{mission.title}</h3><span>{mission.method}</span><b>{mission.question}</b><em><ShieldCheck className="size-4" /> Evidence, uncertainty, and human review remain mandatory before a final finding.</em></article></div></Panel>;
}

function BenchmarksLab() {
  const demos = trpc.geosaarthi.demoCases.useQuery();
  const utils = trpc.useUtils();
  const [demoId, setDemoId] = useState("");
  const active = demos.data?.find((demo) => demo.id === demoId) ?? demos.data?.[0];
  const runner = trpc.geosaarthi.executeAnalysis.useMutation({ onSuccess: () => utils.geosaarthi.recentRuns.invalidate() });
  return <Panel eyebrow="Reproducible benchmark casebook" title="Run a known route and inspect its contract." copy="Cases are scripted prototype demonstrations. Coverage of a route is not a claim of benchmark accuracy, latency, or production readiness.">{demos.isLoading ? <div className="os-data-state"><Activity className="size-4" /> Loading declared benchmark cases…</div> : demos.isError || !active ? <div className="os-data-state is-error"><CircleAlert className="size-4" /> Benchmark cases are unavailable.</div> : <div className="os-benchmark-lab"><div>{demos.data?.map((demo) => <button key={demo.id} className={demo.id === active.id ? "is-selected" : ""} onClick={() => setDemoId(demo.id)}><span>{demo.mode.replaceAll("_", " ")}</span><b>{demo.title}</b><em>{demo.workflow}</em></button>)}</div><article><p>CASE PROTOCOL</p><h3>{active.title}</h3><span>{active.subtitle}</span><b>{active.query}</b><em>{active.assets.length} declared asset{active.assets.length === 1 ? "" : "s"} · workflow {active.workflow}</em><div className="os-benchmark-facts"><span>Coverage <b>Declared route</b></span><span>Metric <b>Not recorded</b></span><span>Latency <b>Not instrumented</b></span><span>Reproducibility <b>Input contract archived</b></span></div><button disabled={runner.isPending} onClick={() => runner.mutate(active)}><Play className="size-3.5" /> {runner.isPending ? "Running visible trace…" : "Run scripted case"}</button></article>{runner.isError ? <p className="os-benchmark-error"><CircleAlert className="size-4" /> Case execution did not complete. Its input contract remains available for review.</p> : runner.data ? <aside><span>CASE RESULT / SCRIPTED ADAPTER</span><b>{runner.data.confidenceLabel} confidence</b><p>{runner.data.trace.length} visible trace stages · {runner.data.evidence.length} evidence references</p><em>Use My Analyses or Report Studio to inspect saved metadata and the report artifact.</em></aside> : <aside><span>REPRODUCIBILITY NOTE</span><b>Case contract ready</b><p>The selected input, task route, evidence convention, and limitation are inspectable before run.</p><em>No calibrated performance metric is asserted in this view.</em></aside>}</div>}</Panel>;
}

function ReportLab() {
  const parts = ["Input metadata", "Validation contract", "Answer and confidence", "Evidence references", "Execution trace", "Provenance and limitation"];
  const [part, setPart] = useState(0);
  return <Panel eyebrow="Mission artifact anatomy" title="Inspect what an evidence-first report contains." copy="Select a saved record in the typed report panel below to generate and export its metadata-only Markdown artifact."><div className="os-report-lab">{parts.map((item, index) => <button key={item} onClick={() => setPart(index)} className={part === index ? "is-selected" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b><ArrowRight className="size-3.5" /></button>)}<article><FileText className="size-6" /><p>INSPECTED ARTIFACT SECTION</p><h3>{parts[part]}</h3><span>The report maintains a chain from observation context to final wording and keeps the stated prototype boundary beside the record.</span></article></div></Panel>;
}

export function ProofRouteLab({ routeId }: { routeId: string }) {
  if (routeId === "evidence") return <EvidenceLab />;
  if (routeId === "spectral") return <SpectralLab />;
  if (routeId === "fusion") return <ComparisonLab kind="fusion" />;
  if (routeId === "time-machine") return <ComparisonLab kind="time" />;
  if (routeId === "missions") return <MissionLab />;
  if (routeId === "benchmarks") return <BenchmarksLab />;
  if (routeId === "reports") return <ReportLab />;
  return null;
}
