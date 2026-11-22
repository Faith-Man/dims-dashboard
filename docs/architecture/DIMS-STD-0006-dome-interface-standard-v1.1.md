# DIMS-STD-0006 — DOME Interface Standard v1.1

**Authority:** DIMS institutional governance; DIMS-STD-0005; Responsive View Standard (RVS) v1.0; EBYC  
**Status:** Institutional Standard  
**Original Date:** 2026-09-04  
**Revision Date:** 2026-09-05  
**Version:** 1.1

## Purpose
Establish one reusable interface standard for DOME/DIMS so shared controls, visual hierarchy, responsive behavior, user preferences, color language, and governed module identity remain consistent across the Enterprise Workspace, DSCC, RAD, SHAMAR, TETELESTAI™, OrEl™, YARATHĒKĒ™, EKKLĒSIA™, MED™, and other governed surfaces.

## Governing Principle
**Shared interaction and visual patterns are enterprise infrastructure, not page-specific decoration.** Reuse the shared shell, design tokens, orb language, and preference services before creating new local controls or palettes.

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

## 4. DOME Visual Language & Palette
The approved visual direction is derived from the controlled-preview DOME interface and the DI² neural-orb family. It is the default visual baseline for newly touched governed surfaces.

### Structural color system
- **Deep royal / navigation:** `#0C1262`
- **Dark hero cobalt:** `#0F1A5E`
- **Primary hero cobalt:** `#111D6C`
- **Lifted hero cobalt:** `#121F72`
- **Panel / translucent cobalt:** approximately `#24317E`
- **Light content surface:** `#F8FAFF`
- **Light secondary surface:** `#EEF2FF`
- **Primary dark text on light surfaces:** approximately `#10184F`
- **Restrained gold accent / divider:** approximately `#D8B64C`
- **Electric/cyan highlight:** approximately `#24E8FF`

These values are governed anchors, not a requirement that every component use every color. Lighter/darker variants may be generated for depth and accessibility, but generic bright-blue replacement palettes must not displace this royal/cobalt system.

### Surface hierarchy
Use the visual rhythm demonstrated by the approved DOME reference:
1. deep royal/cobalt header and hero areas;
2. thin restrained gold dividers where hierarchy benefits;
3. white or very light blue/gray operational content surfaces;
4. navy/cobalt typography on light surfaces and white typography on dark surfaces;
5. soft blue shadow/translucency for depth rather than flat heavy blocks.

### Orb / module identity language
The approved DI² neural orb is the visual-family reference for premium module or intelligence identities.
- Orbs are circular, dimensional, glossy, and spherical rather than flat badges.
- Use a deep-blue core with controlled cobalt highlights.
- Use a restrained gold rim where it helps tie the orb to DOME hierarchy.
- Electric/cyan neural points, short connective traces, or glow may identify active intelligence/module energy.
- White lettering should remain readable at mobile sizes.
- The orb must separate clearly from the surrounding hero background without becoming a neon disk.
- Specialized module orbs may vary their internal highlight color while retaining the shared DOME construction language.

**MED™ implementation precedent:** MED™ uses the DI² orb construction language while retaining its own `MED` identity and brighter cyan/electric highlights so it is visibly distinct from the deep DOME hero background.

## 5. List / Card View Standard
List/Card switching is permitted where the same governed records benefit from dense and visual presentations.

**List view:**
- default for operational scanning, sorting, filtering, comparison, and management;
- preserves table/data-density behavior on capable screens.

**Card view:**
- supports visual scanning and reduced horizontal density;
- must display the same authoritative records and preserve the same filters, sorting, RAC/DEA context, deep links, drawers, and actions;
- must not create a second data source or parallel business-logic renderer when presentation-only transformation is sufficient.

View preference should persist per eligible page or content surface.

## 6. Responsive View Standard Integration
RVS v1.0 remains the responsive authority and is incorporated by reference. This standard does **not** replace TASK-0047; it extends the interface governance around RVS.

On smaller screens:
- controls may wrap or stack without losing meaning;
- card/list content becomes single-column when required;
- touch targets remain usable;
- drawers may become bottom sheets where appropriate;
- no critical information may depend only on hover;
- module/orb identities must remain legible and proportionate without covering operational content.

## 7. Control Hierarchy & Clutter Prevention
Use the smallest number of controls necessary for the user's current level of action.

Preferred order:  
**Global identity and preferences → contextual navigation → search/filter/view → record-level actions.**

Do not repeat the same control in multiple regions unless accessibility or responsive behavior requires it.

## 8. Persistence Standard
User interface preferences must be durable when technically appropriate.

At minimum:
- theme persists globally;
- list/card preference persists per eligible surface;
- persistence must never alter governed record data;
- preference storage failures must degrade safely to a usable default.

## 9. Accessibility & Interaction
Shared controls must:
- use semantic buttons/links;
- expose meaningful accessible names;
- support keyboard activation and visible focus;
- preserve Escape/close behavior for dialogs and drawers;
- avoid color as the only status indicator;
- remain usable with zoom and responsive reflow.

## 10. Implementation Standard
Shared behavior and visual tokens belong in reusable DIMS assets such as:
- `dims-shared.css` for design tokens and common presentation;
- `dims-ui-preferences.js` for shared About/theme/view preference behavior;
- shared components/services as the modernization architecture evolves.

A module may extend the shared standard for specialized needs, but must not silently override the enterprise behavior.

When a governed surface is touched, adopt this visual system deliberately rather than performing an uncontrolled bulk restyle across every page.

## 11. Governance & Change Control
Material changes to the shared shell, theme model, palette, orb language, About semantics, navigation hierarchy, responsive behavior, or reusable view-switch behavior are governed interface changes.

Before adding a new shared UI pattern:
- search existing standards/components under EBYC;
- extend an existing pattern where possible;
- document any necessary exception;
- verify desktop and mobile behavior;
- provide a direct user-verification link before closeout.

## 12. Initial Implementation & v1.1 Extension
The initial implementation established:
- shared About control;
- persistent light/dark theme preference;
- TETELESTAI™ list/card switching using the existing governed renderer;
- shared CSS preference tokens and controls;
- corrected production deployment verification for the current TETELESTAI implementation.

Version 1.1 additionally codifies:
- the approved royal/cobalt DOME palette;
- light operational content surfaces beneath dark hero/header regions;
- restrained gold hierarchy accents;
- the DI² neural orb as the premium orb-family reference;
- MED™ as the first explicit module-level adoption of that orb language.

Additional modules should adopt the shared capabilities deliberately as their pages are touched or as the unified shell work proceeds, rather than through uncontrolled bulk mutation.

## Implementation Relationship
- **TASK-0047** remains the active RVS implementation authority for responsive conformance.
- **DIMS-STD-0006** governs the broader DOME/DIMS interface experience and incorporates RVS v1.0 by reference.
- **DI² neural orb** remains the persistent intelligence access-point standard; module-specific orb adaptations must not imply that the module orb replaces DI².

## Completion Gate
A shared interface change is not complete until:
- source is committed;
- deployment path is verified;
- production is verified where applicable;
- governed task/project records are updated;
- authoritative artifacts and registry entries are synchronized;
- a clickable user-verification link is delivered.
