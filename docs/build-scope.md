# GeoSaarthi MVP Build Scope

The first build is a demo-ready, browser-based analysis workspace. It implements deterministic input validation, intent classification, specialist-workflow routing, evidence-grounded result objects, report text export, and persisted metadata for analysis runs. It deliberately does not ingest raw imagery into database columns, train a foundation model inside the browser, or claim operational Earth-observation accuracy.

The live MVP will ship four benchmark-backed scripted pathways: single-image visual question answering, single-image scene description or grounding, bi-temporal change analysis, and optical–SAR interpretation. Each pathway will expose the workflow trace, a confidence or uncertainty state, provenance, and visually distinct evidence placeholders. The architecture keeps specialist model contracts visible so real models can replace deterministic demo adapters without redesigning the product experience.

