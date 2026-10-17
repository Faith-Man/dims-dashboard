# TASK-0123 — DOME Route Reconciliation

Status: ACTIVE / NON-PRODUCTION
Date: 2026-09-10
Parent workstream: PR #79 — TETELESTAI live-load repair

## Problem
The restored global Navigate control was rendering a mixture of current, legacy, and missing destinations. Some links resolved to construction-era pages; several primary module shell routes were absent from the current repair branch entirely.

## Governing decision
Use one canonical route registry at `config/dome-routes.json`. The global navigation component must consume that registry instead of maintaining its own embedded route list.

Current navigation must expose only governed current destinations. Legacy routes may remain reachable for compatibility or operator recovery, but they are not current navigation targets.

## Recovery source
Recover the already-governed module shells and current enterprise surfaces from `task-0102-final-dome-home` rather than recreating them.

## Verification gate
Before production promotion:
- every primary module link resolves on the Cloudflare branch preview;
- DOME Home resolves;
- Mission Control resolves to the reconciled surface;
- KUBERNĒSIS™ Gateway resolves to `dashboard-v3-current.html`;
- System Health / DSCC resolves to its current surface;
- no current navigation item points directly to `dashboard-v3.html`, `projects-tasks.html`, `orel-studio.html`, or `yaratheke.html`;
- TETELESTAI remains authenticated and loads live data;
- production remains untouched until explicit sign-off.
