# Visual-Polish Motion Review

## Runtime Review Method

The running GeoSaarthi interface was captured in Chromium at distinct virtual-time points rather than assessed only from static source code. For onboarding, frames were captured at 0.9 seconds and 3.6 seconds after initial load. Their SHA-256 values differ, confirming that the initialization sequence visibly progresses: `88c579840d821c45b8847af2a96f76dffa78e1e5647849ad2f981591118467bd` and `e05c721759a665912c09d6c1860c9ad828897f5edc4ddba1541f4f553063a2fc`.

For the normal command-center state, frames captured at 0.8 seconds and 4.2 seconds after entry also differed: `f5caf15f12278bf0566341e6484ee1faad27f0c8d453a2aa5acc8e2b0b111ba2` and `af370e146332254278feb08d42d67e5753b083546670a31a0f31bce322efe998`. This validates that the orbital, acquisition, grid, and telemetry presentation remains active once the analyst reaches the workspace.

| Review surface | Normal-motion result | Reduced-motion result |
|---|---|---|
| Initialization sequence | Time-based step progression is visible before the command center opens. | Animation and transition durations are collapsed; the interface remains readable. |
| Earth and satellite scene | Orbital and acquisition cues continue without altering labels or simulated-data boundaries. | Cursor lighting and continuous visual decoration are suppressed. |
| Intelligence pipeline | Stage-specific loading state and proof hand-off remain visible. | Textual stage and result information remain available without motion. |
| Evidence, trace, and report | Narrative rail and proof package provide direct inspectable transitions. | Controls remain available; no control depends on animated feedback. |

## Outcome

Normal-motion behavior was confirmed in the running UI, and the review-only `motion=reduce` mode was visually checked after removal of the offscreen containment rule that had introduced blank regions. The motion system is therefore additive rather than essential: it enhances spatial context and state change while preserving a complete, stable reduced-motion experience.
