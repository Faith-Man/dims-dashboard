# DOME Deployment Authority and Header Standardization

**Decision date:** 2026-08-14  
**Status:** Approved deployment authority; visual standardization pending preview approval  
**Repository:** `Faith-Man/dims-dashboard`

## Deployment authority

| Role | Cloudflare Worker | Source | Governing status |
|---|---|---|---|
| Canonical production | `dome-dashboard` | Repository `main` | Primary DOME deployment |
| Legacy / staging candidate | `dims-dashboard` | Currently the same repository and branches | Secondary until Cloudflare separation is explicitly approved |

`dome-dashboard` is the authoritative public DOME runtime. `dims-dashboard` predates it and is not the production authority.

Both Workers currently build from the same GitHub repository and therefore receive the same branch commits. This file records authority; it does **not** disconnect, delete, rename, reroute, or otherwise alter either Cloudflare Worker.

## Known-good production checkpoint

- Production branch: `main`
- Recorded known-good commit: `311f870be3b09d9b1686d72bbc3df08b78830ff7`
- Verified by owner on iPhone:
  - DOME loads
  - approved dark header colors display
  - YARATHĒKĒ reader displays complete teaching
  - document and Listen controls display
  - both YARATHĒKĒ navigation buttons route correctly after the final fix

## Shared-header audit

The repository search found 14 runtime pages using `dims-shared.css` and the shared `.page-header` contract.

Already approved dark-header pages:

1. `orel-studio.html`
2. `yaratheke.html`

Pages standardized by this isolated preview:

1. `command-alerts.html`
2. `enterprise-forms.html`
3. `executive-dashboard.html`
4. `institutional-queue.html`
5. `intelligence-briefing.html`
6. `mission-control.html`
7. `neshamah.html`
8. `peace-safety-intelligence.html`
9. `projects-tasks.html`
10. `system-health.html`
11. `system-status.html`
12. `dims-enterprise-grid/projects-tasks.html` (legacy duplicate)

## Preview governance

- Preview branch: `preview/dome-header-standardization`
- Scope: the shared page-header background, header title/subtitle contrast, header action-link contrast, focus state, and mobile header alignment.
- Out of scope: body colors, cards, data, business logic, links, databases, Cloudflare bindings, Worker separation, and production routing.
- Merge gate: owner visual approval of the Cloudflare preview.
- Production rule: do not merge this branch into `main` until that approval is explicit.
- Infrastructure rule: do not disconnect either Worker until a separate Cloudflare deployment-separation decision is explicit.
