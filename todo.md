# Project TODO

- [x] Establish the GeoSaarthi visual system from the supplied requirements and the existing SIH cartographic presentation language.
- [x] Create responsive navigation for Workspace, Demo Cases, Model Registry, Recent Runs, and Project Context.
- [x] Add database models for analysis-run metadata, input metadata, evidence references, and execution traces without storing raw image bytes.
- [x] Implement typed tRPC procedures for demo-case execution, registry retrieval, recent-run retrieval, and combined analysis execution.
- [x] Add a dedicated typed pre-analysis validation and intent-preview procedure.
- [x] Add a dedicated typed analysis-report export procedure that reconstructs a concise report from persisted metadata.
- [x] Implement guided single-image, bi-temporal, and optical–SAR input modes with benchmark selection and simulated upload validation.
- [x] Show metadata, modality, image count, pair compatibility, validation warnings, and actionable rejection states before execution.
- [x] Implement auditable workflow routing for VQA, scene description or grounding, change analysis, and optical–SAR interpretation.
- [x] Render evidence-grounded answers with confidence or uncertainty, overlay placeholders, provenance, model/tool details, and step-by-step execution traces.
- [x] Add four scripted SIH workflow demo cases and graceful invalid-input and low-confidence states.
- [x] Implement concise analysis-report export and recent-run persistence for metadata only.
- [x] Build the SIH26167 project-context and responsible-AI overview with public benchmark sources and bounded-MVP framing.
- [x] Add or update Vitest coverage for routing, validation, report generation, and persistence behavior.
- [x] Verify desktop and mobile responsive rendering, run the test suite, and resolve build errors.
- [x] Save a final checkpoint with all completed items marked complete.
