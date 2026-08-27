import { Activity, AlertTriangle, ArrowRight, BookOpen, Check, CircleAlert, Cog, Database, Gauge, HelpCircle, Play, Radio, Search, ShieldCheck, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";

type ReplayTrace = { label: string; detail: string; status: string };

function Panel({ title, eyebrow, copy, children }: { title: string; eyebrow: string; copy: string; children: ReactNode }) {
  return <section className="os-route-lab os-operations-lab"><header><p><span /> {eyebrow}</p><h2>{title}</h2><span>{copy}</span></header>{children}</section>;
}

function AlertsLab() {
  const initialAlerts = [
    { id: "change", type: "Change cue", title: "Temporal difference requires review", copy: "A declared comparison layer is available for analyst inspection.", tone: "amber" },
    { id: "system", type: "System", title: "Prototype services nominal", copy: "This label reflects the local interface state, not production uptime.", tone: "cyan" },
    { id: "satellite", type: "Satellite", title: "Pass context requires confirmation", copy: "The displayed orbital path is an instructional context and not a live satellite alert feed.", tone: "cyan" },
    { id: "model", type: "Model", title: "Adapter limitation visible", copy: "Specialist routing is bounded by its stated accepted inputs and limitations.", tone: "green" },
  ];
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState("all");
  const visible = alerts.filter((item) => filter === "all" || item.type.toLowerCase() === filter);
  return <Panel eyebrow="Prototype attention queue" title="Triage a review cue, not a live alert." copy="Alert rows are controlled demonstration states. They never represent operational monitoring notifications or an external satellite feed."><div className="os-alert-tools"><div className="os-segmented">{["all", "change cue", "system", "model"].map((item) => <button key={item} className={filter === item.toLowerCase() ? "is-selected" : ""} onClick={() => setFilter(item.toLowerCase())}>{item}</button>)}</div><span>{visible.length} visible demo state{visible.length === 1 ? "" : "s"}</span></div><div className="os-alert-list">{visible.length === 0 ? <div className="os-data-state"><Check className="size-4" /> No demonstration alert matches this filter.</div> : visible.map((alert) => <article key={alert.id} className={`is-${alert.tone}`}><span>{alert.type}</span><b>{alert.title}</b><p>{alert.copy}</p><button onClick={() => setAlerts((current) => current.filter((item) => item.id !== alert.id))}>Mark reviewed <Check className="size-3.5" /></button></article>)}</div></Panel>;
}

function ObservatoryLab() {
  const recentRuns = trpc.geosaarthi.recentRuns.useQuery({ limit: 8 });
  const [scope, setScope] = useState("run metadata");
  const cards = [
    { label: "GPU", value: "Not instrumented", note: "No GPU utilization or hardware capacity is claimed." },
    { label: "CPU", value: "Not instrumented", note: "No CPU utilization or throughput is claimed." },
    { label: "API route", value: "Local typed contract", note: "Available only within this prototype session." },
    { label: "Storage", value: "Metadata-only record", note: "Raw image bytes are intentionally excluded." },
    { label: "Latency", value: "Not measured", note: "No execution timing is presented as an operational metric." },
    { label: "Uptime", value: "Not monitored", note: "The prototype does not report service-level uptime." },
    { label: "Model health", value: "Declared limitation", note: "Registry entries specify intended inputs and bounds, not runtime health." },
  ];
  const selected = cards.find((card) => card.label.toLowerCase() === scope) ?? cards[0];
  return <Panel eyebrow="System observability boundary" title="Observe what the prototype actually records." copy="The observatory separates available run metadata from illustrative interface indicators and avoids unsupported operational-performance claims."><div className="os-observatory-layout"><div className="os-observatory-cards">{cards.map((card) => <button key={card.label} className={scope === card.label.toLowerCase() ? "is-selected" : ""} onClick={() => setScope(card.label.toLowerCase())}><span>{card.label}</span><b>{card.value}</b><em>{card.note}</em></button>)}</div><article><p>INSPECTED OBSERVABILITY SECTION / {selected.label}</p>{recentRuns.isLoading ? <span><Activity className="size-4" /> Reading recorded analysis metadata…</span> : recentRuns.isError ? <span><CircleAlert className="size-4" /> Run metadata is unavailable in this session.</span> : <><b>{selected.value}</b><span>{selected.note}</span><em>{selected.label === "Storage" ? `${recentRuns.data?.length ?? 0} saved analysis metadata record${(recentRuns.data?.length ?? 0) === 1 ? "" : "s"} are currently available.` : "This section is a declared observability boundary, not an operational telemetry measurement."}</em></>}</article></div></Panel>;
}

function LearningLab() {
  const lessons = [
    { id: "optical", title: "Optical imagery", length: "04 min", copy: "Learn how visible context, texture, and acquisition framing affect scene interpretation." },
    { id: "sar", title: "SAR reasoning", length: "06 min", copy: "Understand why radar texture complements optical imagery and requires different caution." },
    { id: "spectral", title: "Multispectral concepts", length: "05 min", copy: "Use wavelength concepts without treating an illustrative UI curve as a calibrated measurement." },
    { id: "ai", title: "Evidence-first AI", length: "05 min", copy: "Follow validation, route selection, evidence, uncertainty, and human review into a final answer." },
  ];
  const [lessonId, setLessonId] = useState("optical");
  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0];
  return <Panel eyebrow="Remote-sensing learning deck" title="Practice the discipline behind the interface." copy="Lessons are concise learning aids. They explain concepts and limitations but do not replace expert remote-sensing analysis."><div className="os-learning-layout"><div>{lessons.map((item, index) => <button key={item.id} className={item.id === lesson.id ? "is-selected" : ""} onClick={() => setLessonId(item.id)}><span>{String(index + 1).padStart(2, "0")} / {item.length}</span><b>{item.title}</b><ArrowRight className="size-3.5" /></button>)}</div><article><BookOpen className="size-6" /><p>ACTIVE LESSON</p><h3>{lesson.title}</h3><span>{lesson.copy}</span><Link href={lesson.id === "sar" ? "/fusion" : lesson.id === "spectral" ? "/spectral" : "/evidence"}>Open related lab <ArrowRight className="size-3.5" /></Link></article></div></Panel>;
}

function SettingsLab({ highContrast, manualMotionReduce, onContrast, onMotion }: { highContrast: boolean; manualMotionReduce: boolean; onContrast: () => void; onMotion: () => void }) {
  const [retention, setRetention] = useState("metadata-only");
  const [accountOpen, setAccountOpen] = useState(false);
  return <Panel eyebrow="Local interface preferences" title="Make the command surface work for you." copy="Preferences in this prototype affect this browser view only. Retention explicitly describes the application’s metadata-only persistence model."><div className="os-settings-layout"><article><p>APPEARANCE</p><b>{highContrast ? "High contrast active" : "Standard dark command view"}</b><span>Increase contrast while retaining the Earth Intelligence visual hierarchy.</span><button onClick={onContrast}><Cog className="size-4" /> {highContrast ? "Return to standard contrast" : "Enable high contrast"}</button></article><article><p>MOTION</p><b>{manualMotionReduce ? "Motion reduced" : "Standard motion cues"}</b><span>Disable non-essential animation in this route session; `?motion=reduce` also enables review mode.</span><button onClick={onMotion}><TimerReset className="size-4" /> {manualMotionReduce ? "Restore motion" : "Reduce motion"}</button></article><article><p>DATA RETENTION</p><b>Analysis persistence</b><span>Raw image bytes are not written to the application database.</span><div className="os-segmented">{["metadata-only", "session-view"].map((item) => <button key={item} onClick={() => setRetention(item)} className={retention === item ? "is-selected" : ""}>{item}</button>)}</div></article><article><p>ACCOUNT BOUNDARY</p><b>Prototype session profile</b><span>Authentication is supplied by the app scaffold; profile editing and cloud preference sync are not implemented in this prototype.</span><button onClick={() => setAccountOpen((value) => !value)}><ShieldCheck className="size-4" /> {accountOpen ? "Hide account boundary" : "Inspect account boundary"}</button>{accountOpen ? <em>Identity is used only where the existing backend records a nullable run owner. No account preference data is stored by this panel.</em> : null}</article></div></Panel>;
}

function HelpLab() {
  const guides = [
    { title: "Launch an analysis", copy: "Declare a compatible benchmark input, check validation, then execute a visible prototype route.", href: "/workspace" },
    { title: "Inspect evidence", copy: "Link a response back to an evidence reference and keep its limitation visible.", href: "/evidence" },
    { title: "Review a trace", copy: "Open a saved metadata-only record and replay the emitted analysis stages.", href: "/replay" },
    { title: "Prepare a judge demo", copy: "Use the controlled judge sequence to show route contracts and artifact progression.", href: "/judge" },
    { title: "Read the typed API surface", copy: "Inspect the bounded query and mutation procedures used by this local prototype interface.", href: "/help#api-surface" },
  ];
  const [query, setQuery] = useState("");
  const matches = guides.filter((guide) => `${guide.title} ${guide.copy}`.toLowerCase().includes(query.toLowerCase()));
  return <Panel eyebrow="Interactive documentation" title="Find the workflow, then enter the relevant surface." copy="These guides describe the visible GeoSaarthi prototype contract, not a live external API or autonomous remote-sensing service."><div className="os-help-search"><Search className="size-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tutorials and workflow guides" /></div><div className="os-help-list">{matches.length === 0 ? <div className="os-data-state"><HelpCircle className="size-4" /> No guide matches that phrase.</div> : matches.map((guide, index) => <Link key={guide.title} href={guide.href}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{guide.title}</b><p>{guide.copy}</p></div><ArrowRight className="size-4" /></Link>)}</div><article id="api-surface" className="os-api-guide"><p>LOCAL TYPED API SURFACE</p><div><span>demoCases / modelRegistry / previewAnalysis / recentRuns / analysisRun / exportReport</span><b>Query procedures</b></div><div><span>executeAnalysis</span><b>Metadata-only run mutation</b></div><em>Procedures are available to this application’s typed client contract. This panel does not expose a public production API endpoint, credentials, rate limit, or uptime claim.</em></article></Panel>;
}

function JudgeLab() {
  const demos = trpc.geosaarthi.demoCases.useQuery();
  const utils = trpc.useUtils();
  const runner = trpc.geosaarthi.executeAnalysis.useMutation({ onSuccess: () => utils.geosaarthi.recentRuns.invalidate() });
  const [station, setStation] = useState(0);
  const [lastTrace, setLastTrace] = useState<ReplayTrace[]>([]);
  const [status, setStatus] = useState<"ready" | "running" | "done" | "error">("ready");
  const stations = ["Validate declared contracts", "Single-image question", "Grounding reference", "Bi-temporal change", "Optical–SAR fusion & report hand-off"];
  async function runDemonstration() {
    if (!demos.data) return;
    setStatus("running");
    setStation(0);
    setLastTrace([]);
    try {
      for (let index = 0; index < demos.data.length; index += 1) {
        setStation(index + 1);
        const result = await runner.mutateAsync(demos.data[index]);
        setLastTrace([...result.trace, { label: "Evidence package", detail: `${result.evidence.length} declared visual evidence reference${result.evidence.length === 1 ? "" : "s"} remain available for analyst review.`, status: "available" }, { label: "Confidence boundary", detail: `${result.confidenceLabel} confidence: ${result.confidenceNote}`, status: "available" }, { label: "Report hand-off", detail: `Metadata-only run ${result.runId} is available in Report Studio and Mission Replay.`, status: "available" }]);
      }
      setStation(4);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }
  return <Panel eyebrow="SIH judge-facing demonstration" title="Run four declared cases through five visible review stations." copy="The sequence uses the four existing scripted benchmark inputs plus a final report hand-off. It is a controlled prototype demo—not live satellite processing or measured production evaluation."><div className="os-judge-lab"><div className="os-judge-stations">{stations.map((item, index) => <button key={item} className={station === index ? "is-selected" : index < station || status === "done" ? "is-complete" : ""} onClick={() => setStation(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b>{index < station || status === "done" ? <Check className="size-3.5" /> : <Radio className="size-3.5" />}</button>)}</div><article><p>ONE-CLICK PROTOTYPE DEMO</p><b>{status === "running" ? "Executing declared benchmark route…" : status === "done" ? "All declared cases completed" : status === "error" ? "Review case execution" : "Ready to begin"}</b><span>{status === "done" ? "Metadata records are available in My Analyses and Report Studio." : "The sequence shows validation, routing, evidence, trace, confidence, and the report hand-off."}</span><button disabled={status === "running" || demos.isLoading || !demos.data} onClick={runDemonstration}><Play className="size-4" /> {status === "running" ? "Running demonstration…" : "Run declared benchmark sequence"}</button></article><aside>{status === "error" ? <p className="is-error"><CircleAlert className="size-4" /> The demo did not complete. Its declared contracts remain inspectable.</p> : lastTrace.length === 0 ? <p><Gauge className="size-4" /> The live trace panel will populate when a declared case is run.</p> : <ol>{lastTrace.map((step) => <li key={step.label}><span>{step.status}</span><b>{step.label}</b><em>{step.detail}</em></li>)}</ol>}</aside></div></Panel>;
}

function MissionReplayLab() {
  const initialRunId = new URLSearchParams(window.location.search).get("runId") ?? "";
  const [runId, setRunId] = useState(initialRunId);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const runs = trpc.geosaarthi.recentRuns.useQuery({ limit: 24 });
  useEffect(() => { if (!runId && runs.data?.[0]) setRunId(runs.data[0].runId); }, [runId, runs.data]);
  const record = trpc.geosaarthi.analysisRun.useQuery({ runId: runId || "pending" }, { enabled: Boolean(runId) });
  const report = trpc.geosaarthi.exportReport.useQuery({ runId: runId || "pending" }, { enabled: Boolean(runId) });
  const trace = Array.isArray(record.data?.trace) ? record.data.trace as ReplayTrace[] : [];
  const steps = useMemo(() => record.data ? [
    { label: "Input", detail: "Declared asset metadata only; raw image bytes are never replayed.", status: "recorded" },
    { label: "Validation", detail: "Persisted validation record restored for inspection.", status: "recorded" },
    ...trace,
    { label: "Answer", detail: "Persisted answer and confidence are restored as a final metadata artifact.", status: "recorded" },
    { label: "Report", detail: "A concise report is reconstructed from persisted metadata without reprocessing imagery.", status: "recorded" },
  ] : [], [record.data, trace]);
  function selectRun(nextRunId: string) { setRunId(nextRunId); setVisibleSteps(0); }
  return <Panel eyebrow="Metadata-only execution replay" title="Revisit an emitted trace, stage by stage." copy="Replay reconstructs the persisted input metadata, validation, evidence context, trace, answer, and limitation. It never reprocesses raw imagery or claims a new inference.">{runs.isLoading ? <div className="os-data-state"><Activity className="size-4" /> Loading replay-eligible metadata…</div> : runs.isError ? <div className="os-data-state is-error"><CircleAlert className="size-4" /> Saved analysis metadata is unavailable.</div> : (runs.data?.length ?? 0) === 0 ? <div className="os-data-state"><Database className="size-4" /> No persisted analysis is available to replay. Run a declared benchmark first.</div> : <div className="os-replay-lab"><div className="os-replay-runs">{runs.data?.map((run) => <button key={run.runId} onClick={() => selectRun(run.runId)} className={run.runId === runId ? "is-selected" : ""}><span>{run.status}</span><b>{run.query}</b><em>{run.runId}</em></button>)}</div><article><div><p>REPLAY CONTROL</p><b>{record.isLoading ? "Restoring metadata…" : record.isError || !record.data ? "Record unavailable" : record.data.query}</b><span>{record.data ? `${record.data.task.replaceAll("_", " ")} · confidence ${record.data.overallConfidence}` : "A run must resolve before replay begins."}</span></div><div className="os-replay-controls"><button disabled={!record.data || record.isLoading || visibleSteps === 0} onClick={() => setVisibleSteps((value) => Math.max(0, value - 1))}>← Previous stage</button><button disabled={!record.data || record.isLoading || visibleSteps >= steps.length} onClick={() => setVisibleSteps((value) => value === 0 ? 1 : Math.min(steps.length, value + 1))}>{visibleSteps === 0 ? <><Play className="size-4" /> Start replay</> : "Next stage →"}</button></div><ol>{steps.slice(0, visibleSteps).map((step, index) => <li key={`${step.label}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{step.label}</b><p>{step.detail}</p></div><em>{step.status}</em></li>)}</ol>{visibleSteps === steps.length && record.data ? <aside><Check className="size-4" /> Replay complete. The persisted answer was: <b>{record.data.answer}</b>{report.isLoading ? <span>Reconstructing report-stage artifact…</span> : report.data ? <><span>Report stage reconstructed from metadata: {report.data.fileName}</span><Link href={`/reports?runId=${encodeURIComponent(runId)}`}>Open report artifact <ArrowRight className="size-3.5" /></Link></> : <span>The report artifact is unavailable for this selected metadata record.</span>}</aside> : null}</article></div>}</Panel>;
}

export function OperationsRouteLab({ routeId, highContrast, manualMotionReduce, onContrast, onMotion }: { routeId: string; highContrast: boolean; manualMotionReduce: boolean; onContrast: () => void; onMotion: () => void }) {
  if (routeId === "alerts") return <AlertsLab />;
  if (routeId === "observatory") return <ObservatoryLab />;
  if (routeId === "learn") return <LearningLab />;
  if (routeId === "settings") return <SettingsLab highContrast={highContrast} manualMotionReduce={manualMotionReduce} onContrast={onContrast} onMotion={onMotion} />;
  if (routeId === "help") return <HelpLab />;
  if (routeId === "judge") return <JudgeLab />;
  if (routeId === "replay") return <MissionReplayLab />;
  return null;
}
