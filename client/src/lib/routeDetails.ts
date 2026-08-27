export type RouteDetail = { label: string; title: string; copy: string; action: string };

export const routeDetails: Record<string, RouteDetail[]> = {
  landing: [
    { label: "Mission statement", title: "Earth intelligence with proof attached.", copy: "GeoSaarthi turns a question into a visible route through observation, reasoning, evidence, trace, and report.", action: "Open mission control" },
    { label: "Observation link", title: "Satellite context before inference.", copy: "The interface keeps scene, sensor relationship, and stated source boundary within the analyst’s view.", action: "Inspect Earth" },
    { label: "First action", title: "Choose a bounded mission.", copy: "Start with a compatible benchmark flow or enter the workspace with explicit input requirements.", action: "Start analysis" },
  ],
  dashboard: [
    { label: "System health", title: "Prototype readiness is visible.", copy: "Local workflow readiness, stored metadata count, and simulated telemetry are labeled separately.", action: "Inspect health" },
    { label: "Recent analyses", title: "Return to recorded evidence paths.", copy: "Analysis history is metadata-only and designed for an analyst to reopen a mission context.", action: "Open analyses" },
    { label: "AI query", title: "Ask a bounded Earth question.", copy: "Move directly to a selected input relationship before specialist routing begins.", action: "New analysis" },
  ],
  "new-analysis": [
    { label: "Single image", title: "One observation, one scene question.", copy: "Use visual question answering, scene description, or grounding within a declared optical scene.", action: "Select single" },
    { label: "Bi-temporal", title: "Two matched observations, one change question.", copy: "Compare an aligned benchmark pair to inspect what visibly changed between dates.", action: "Select temporal" },
    { label: "Optical–SAR", title: "Two sensors, complementary evidence.", copy: "Set the cross-modal contract before entering optical–radar interpretation.", action: "Select fusion" },
  ],
  workspace: [
    { label: "Imagery", title: "Layered analyst view.", copy: "Inspect the active benchmark layer, evidence zone, and declared image relationship.", action: "Focus imagery" },
    { label: "AI query", title: "Natural language with a visible route.", copy: "A precise question determines the compatible specialist workflow and review state.", action: "Review route" },
    { label: "Confidence", title: "Measure uncertainty with context.", copy: "Confidence is coupled to evidence references, declared limitations, and a trace—not decorative color.", action: "Inspect confidence" },
  ],
  earth: [
    { label: "Layers", title: "Move between declared observation layers.", copy: "Optical, radar, and change views are presented as supplied benchmark layers.", action: "Toggle layer" },
    { label: "Locations", title: "Select an area of interest.", copy: "Each sector carries a stated scenario and compatible mission hand-off.", action: "Select AOI" },
    { label: "Coverage", title: "Read the observation context.", copy: "Coverage is a demonstration visual and is never presented as a live GIS availability claim.", action: "Inspect coverage" },
  ],
  satellites: [
    { label: "Orbit", title: "Trace a declared pass context.", copy: "The orbital field provides spatial context for the supplied observation rather than real-world tracking.", action: "Select pass" },
    { label: "Telemetry", title: "Keep simulation status visible.", copy: "Position, heading, and pass status are illustrative mission-interface data.", action: "Read telemetry" },
    { label: "Ground track", title: "Connect orbit to observed scene.", copy: "A visual ground track explains acquisition geometry at a conceptual level.", action: "Inspect track" },
  ],
  monitor: [
    { label: "Monitored regions", title: "Focus attention by scenario.", copy: "Floodplain, urban, vegetation, and coastal regions are framed as benchmark review areas.", action: "Select region" },
    { label: "Temporal comparison", title: "Compare declared acquisitions.", copy: "Paired dates and layer alignment form the basis for a visible change review.", action: "Compare dates" },
    { label: "Detected change", title: "Treat the cue as evidence to inspect.", copy: "A visual detection must remain linked to imagery and analyst uncertainty.", action: "Inspect cue" },
  ],
  analyses: [
    { label: "History", title: "Metadata-led mission archive.", copy: "Saved work contains query, workflow, confidence, provenance, and trace references—not image bytes.", action: "Load history" },
    { label: "Search", title: "Find a prior question or route.", copy: "Search scopes to local prototype metadata so it does not imply a global intelligence archive.", action: "Search runs" },
    { label: "Filters", title: "Narrow by workflow and outcome.", copy: "Review successful, uncertain, and rejected states with an explicit analyst context.", action: "Filter results" },
  ],
  datasets: [
    { label: "Explorer", title: "Browse sources by sensor role.", copy: "Dataset cards expose modality, sample purpose, and intended use in the demonstration.", action: "Browse source" },
    { label: "Metadata", title: "Read what accompanies an image.", copy: "File type, sensor relationship, and declared source context remain visible to the analyst.", action: "Inspect metadata" },
    { label: "Provenance", title: "Follow the source path.", copy: "Provenance details distinguish a public benchmark reference from an evaluation assumption.", action: "Open provenance" },
  ],
  models: [
    { label: "Registry", title: "Know the specialist before it responds.", copy: "Each adapter states its task, accepted input, version, and known limitation.", action: "Inspect model" },
    { label: "Capabilities", title: "Route only compatible requests.", copy: "Capability cards connect a model’s declared role to the appropriate analysis contract.", action: "Compare capabilities" },
    { label: "Licenses", title: "Keep model context explicit.", copy: "Licensing and availability are presented as review notes, not as broad deployment guarantees.", action: "Review notes" },
  ],
  workflow: [
    { label: "Graph", title: "The pipeline is a visible instrument.", copy: "Nodes represent the bounded data contract from input through evidence packaging.", action: "Select node" },
    { label: "Tools", title: "Inspect the adapter hand-off.", copy: "Tool selection is stated rather than hidden behind a single opaque response.", action: "Inspect tools" },
    { label: "Execution", title: "Move through the route deliberately.", copy: "The graph reveals structured prototype processing, not private model chain-of-thought.", action: "Run graph" },
  ],
  evidence: [
    { label: "Detected regions", title: "Pin each claim to a visible zone.", copy: "Evidence boxes help an analyst return from answer text to the relevant visual reference.", action: "Focus region" },
    { label: "Masks and heatmaps", title: "Make spatial emphasis inspectable.", copy: "The interface uses bounded overlays for scene review, not calibrated operational masks.", action: "Toggle overlay" },
    { label: "Relationships", title: "Link question, layer, and evidence.", copy: "Evidence objects are organized by their role in supporting an answer and its uncertainty.", action: "Trace relationship" },
  ],
  spectral: [
    { label: "Bands", title: "Start with the wavelength idea.", copy: "The band selector introduces how different spectral ranges can reveal scene properties.", action: "Select band" },
    { label: "Pixel inspector", title: "Treat a pixel as a learning object.", copy: "The prototype makes conceptual inspection explicit rather than claiming upload-derived readings.", action: "Inspect pixel" },
    { label: "Curves", title: "See spectral distinction as a pattern.", copy: "Illustrative curves explain the role of wavelength without representing derived sample values.", action: "Read curve" },
  ],
  fusion: [
    { label: "Dual modality", title: "Hold optical and SAR together.", copy: "A split visual makes their complementary cues legible before fusion reasoning begins.", action: "Move divider" },
    { label: "Comparison", title: "Inspect texture and context side by side.", copy: "The two modalities provide different cues for the same bounded benchmark scenario.", action: "Switch modality" },
    { label: "Reasoning", title: "Make cross-modal logic visible.", copy: "The workflow explains why a mixed optical–radar input selects the fusion specialist.", action: "Open route" },
  ],
  "time-machine": [
    { label: "Historical imagery", title: "Place both scenes on one rail.", copy: "The interface makes the before and after relationship clear before a change conclusion is reviewed.", action: "Scrub timeline" },
    { label: "Before and after", title: "Compare without losing context.", copy: "A deliberate toggle or swipe reveals the declared temporal acquisition pair.", action: "Compare pair" },
    { label: "Change map", title: "Expose the visual difference.", copy: "The change layer directs attention but remains tied to analyst validation and uncertainty.", action: "Open difference" },
  ],
  missions: [
    { label: "Flood", title: "Read water and radar context together.", copy: "Flood is a guided cross-modal mission that makes its scenario scope and evidence path visible.", action: "Open flood mission" },
    { label: "Urban", title: "Inspect visible development over time.", copy: "Urban change is framed as a bi-temporal evidence exercise rather than an automated planning recommendation.", action: "Open urban mission" },
    { label: "Land and coast", title: "Choose the right observing question.", copy: "Forest, agriculture, and coastal scenarios guide the user to a compatible prototype route.", action: "Open scenario" },
  ],
  benchmarks: [
    { label: "Cases", title: "Exercise the required workflows.", copy: "The benchmark lab demonstrates VQA, grounding, change analysis, and optical–SAR interpretation.", action: "Run case" },
    { label: "Metrics", title: "Separate readiness from performance.", copy: "Coverage and recorded-run metadata are visible; real accuracy claims require reproducible labels.", action: "Inspect metric" },
    { label: "Reproducibility", title: "Keep the route reviewable.", copy: "A case carries its input type, question, expected workflow, evidence state, and trace contract.", action: "View protocol" },
  ],
  reports: [
    { label: "Generate", title: "Build the final mission artifact.", copy: "The report assembles input metadata, question, answer, confidence, evidence, trace, and limitations.", action: "Generate report" },
    { label: "Preview", title: "Inspect before export.", copy: "A readable report view keeps the evidence and uncertainty close to the final wording.", action: "Preview artifact" },
    { label: "Export", title: "Take only declared metadata.", copy: "Export follows the metadata-only storage contract of the prototype.", action: "Export record" },
  ],
  alerts: [
    { label: "Change alerts", title: "Surface an evidence cue, not an order.", copy: "Change items route an analyst toward comparative imagery and declared uncertainty.", action: "Inspect change" },
    { label: "System alerts", title: "Make boundary states visible.", copy: "Readiness and review states are distinguishable from any operational incident claim.", action: "Review system" },
    { label: "Model alerts", title: "Show a limitation early.", copy: "Model-related attention states surface accepted inputs and known constraints.", action: "Review model" },
  ],
  observatory: [
    { label: "System", title: "Observe prototype health transparently.", copy: "The observatory differentiates locally derived run metrics from illustrative system context.", action: "Inspect system" },
    { label: "Latency", title: "Keep measurement claims bounded.", copy: "The interface labels live and recorded observations separately from scripted timing examples.", action: "Read timing" },
    { label: "Storage", title: "Confirm the metadata boundary.", copy: "Raw image bytes do not enter the analysis-run database in the current implementation.", action: "Inspect policy" },
  ],
  learn: [
    { label: "Optical", title: "Learn what a reflected scene can show.", copy: "A short lesson links visual color and texture to supported scene questions.", action: "Open optical lesson" },
    { label: "SAR", title: "Learn what radar adds.", copy: "Radar interpretation is explained as complementary context, particularly when optical data is limited.", action: "Open SAR lesson" },
    { label: "AI", title: "Learn the evidence-first route.", copy: "The lesson emphasizes validation, uncertainty, and human review over unsupported automation claims.", action: "Open AI lesson" },
  ],
  settings: [
    { label: "Appearance", title: "Set the local visual workspace.", copy: "Contrast, display treatment, and motion preferences support sustained analysis work.", action: "Adjust display" },
    { label: "Retention", title: "Read the data boundary.", copy: "The product states what remains in browser memory and what metadata may persist.", action: "Open retention" },
    { label: "Accessibility", title: "Keep the system usable without motion.", copy: "Keyboard access and reduced-motion behavior remain part of the core interface contract.", action: "Check accessibility" },
  ],
  help: [
    { label: "Tutorials", title: "Start from a real analyst question.", copy: "Guides lead through the bounded input, route, evidence, trace, and report sequence.", action: "Open tutorial" },
    { label: "API", title: "Describe the available surface.", copy: "Documentation reflects the prototype’s public interaction contracts rather than undeclared services.", action: "Read API guide" },
    { label: "Workflow guides", title: "Make each mode understandable.", copy: "Single image, change analysis, and optical–SAR flows are documented as distinct paths.", action: "Open workflow guide" },
  ],
  judge: [
    { label: "Five missions", title: "Show the complete proof route.", copy: "Judge mode guides a reviewer through selected demonstrations with no hidden developer setup.", action: "Start demo" },
    { label: "Live trace", title: "Reveal execution as it happens.", copy: "Visible stages show validation, routing, evidence, confidence, and report packaging.", action: "Open trace" },
    { label: "Outcome", title: "Finish with a report artifact.", copy: "The demonstration ends with an inspectable export contract and stated limitations.", action: "Open report" },
  ],
  replay: [
    { label: "Input", title: "Return to the mission context.", copy: "Replay begins with declared assets, modality, and the analyst question.", action: "Replay input" },
    { label: "Decision", title: "Inspect every hand-off.", copy: "Validation, routing, model selection, evidence, and answer appear in a deliberate sequence.", action: "Step forward" },
    { label: "Artifact", title: "Close the loop with proof.", copy: "The final stage links to a report that captures available metadata and limitations.", action: "Open artifact" },
  ],
};

export function routeDetailFor(id: string) {
  return routeDetails[id] ?? routeDetails.landing;
}
