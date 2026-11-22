# DIMS-STD-0006 — DOME Interface Standard v1.0

**Authority:** DIMS institutional governance; DIMS-STD-0005; Responsive View Standard (RVS) v1.0; EBYC  
**Status:** Institutional Standard  
**Original Date:** 2026-09-04  
**Version:** 1.0

## Purpose
Establish one reusable interface standard for DOME/DIMS so shared controls, visual hierarchy, responsive behavior, and user preferences remain consistent across the Enterprise Workspace, DSCC, RAD, SHAMAR, TETELESTAI™, OrEl™, YARATHĒKĒ™, EKKLĒSIA™, and other governed surfaces.

## Governing Principle
**Shared interaction patterns are enterprise infrastructure, not page-specific decoration.** Reuse the shared shell and preference services before creating new local controls.

## 1. Shared Header Standard
Every eligible DOME/DIMS page should use a clear hierarchy:
- **Identity:** page/module name and concise purpose.
- **Global controls:** About, theme preference, and Home/back navigation where applicable.
- **Module navigation:** contextual navigation below the primary header.
- **Page controls:** search, filters, view switches, and record actions belong with the content they control.

Avoid placing page-specific actions in the global header. The header must remain recognizable across modules without becoming a developer toolbar.

## 2. About Standard
A persistent About control should be available from the shared header on eligible surfaces.

The About experience should explain:
- what DOME is;
- what DIMS is;
- how the current surface fits into the operating environment;
- the governing purpose of shared modules and DOMEs;
- version/build information when operationally useful.

About content is institutional orientation, not marketing copy.

## 3. Light / Dark Theme Standard
Light and dark themes are shared DIMS preferences.

Requirements:
- Theme preference persists across refreshes.
- Shared design tokens control surfaces, text, borders, inputs, overlays, and common components.
- Individual pages must not independently invent incompatible dark themes.
- System preference may initialize the first visit; explicit user choice takes precedence thereafter.
- Contrast and readability remain acceptable in both modes.

## 4. List / Card View Standard
List/Card switching is permitted where the same governed records benefit from dense and visual presentations.

**List view:**
- default for operational scanning, sorting, filtering, comparison, and management;
- preserves table/data-density behavior on capable screens.

**Card view:**
- supports visual scanning and reduced horizontal density;
- must display the same authoritative records and preserve the same filters, sorting, RAC/DEA context, deep links, drawers, and actions;
- must not create a second data source or parallel business-logic renderer when presentation-only transformation is sufficient.

View preference should persist per eligible page or content surface.

## 5. Responsive View Standard Integration
RVS v1.0 remains the responsive authority and is incorporated by reference. This standard does **not** replace TASK-0047; it extends the interface governance around RVS.

On smaller screens:
- controls may wrap or stack without losing meaning;
- card/list content becomes single-column when required;
- touch targets remain usable;
- drawers may become bottom sheets where appropriate;
- no critical information may depend only on hover.

## 6. Control Hierarchy & Clutter Prevention
Use the smallest number of controls necessary for the user's current level of action.

Preferred order:  
**Global identity and preferences → contextual navigation → search/filter/view → record-level actions.**

Do not repeat the same control in multiple regions unless accessibility or responsive behavior requires it.

## 7. Persistence Standard
User interface preferences must be durable when technically appropriate.

At minimum:
- theme persists globally;
- list/card preference persists per eligible surface;
- persistence must never alter governed record data;
- preference storage failures must degrade safely to a usable default.

## 8. Accessibility & Interaction
Shared controls must:
- use semantic buttons/links;
- expose meaningful accessible names;
- support keyboard activation and visible focus;
- preserve Escape/close behavior for dialogs and drawers;
- avoid color as the only status indicator;
- remain usable with zoom and responsive reflow.

## 9. Implementation Standard
Shared behavior belongs in reusable DIMS assets such as:
- `dims-shared.css` for design tokens and common presentation;
- `dims-ui-preferences.js` for shared About/theme/view preference behavior;
- shared components/services as the modernization architecture evolves.

A module may extend the shared standard for specialized needs, but must not silently override the enterprise behavior.

## 10. Governance & Change Control
Material changes to the shared shell, theme model, About semantics, navigation hierarchy, responsive behavior, or reusable view-switch behavior are governed interface changes.

Before adding a new shared UI pattern:
- search existing standards/components under EBYC;
- extend an existing pattern where possible;
- document any necessary exception;
- verify desktop and mobile behavior;
- provide a direct user-verification link before closeout.

## 11. Initial Implementation
The initial implementation establishes:
- shared About control;
- persistent light/dark theme preference;
- TETELESTAI™ list/card switching using the existing governed renderer;
- shared CSS preference tokens and controls;
- corrected production deployment verification for the current TETELESTAI implementation.

The first rollout surface is TETELESTAI™ Projects & Tasks. Additional modules should adopt the shared capabilities deliberately as their pages are touched or as the unified shell work proceeds, rather than through uncontrolled bulk mutation.

## Implementation Relationship
- **TASK-0047** remains the active RVS implementation authority for responsive conformance.
- **DIMS-STD-0006** governs the broader DOME/DIMS interface experience and incorporates RVS v1.0 by reference.

## Completion Gate
A shared interface change is not complete until:
- source is committed;
- deployment path is verified;
- production is verified where applicable;
- governed task/project records are updated;
- authoritative artifacts and registry entries are synchronized;
- a clickable user-verification link is delivered.
