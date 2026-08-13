# Codex Handoff — Cloudflare Preview Verification

Date: 2026-08-13
Repository: Faith-Man/dims-dashboard
Branch: feature/dscc-orbital-intelligence
PR: #9

## Objective

Use Codex as the execution environment for the non-production Cloudflare preview and verification of the current DOME System Command Center and preserved YARATHĒKĒ Reader. Do not modify either live Cloudflare Worker.

## Verified source state

A fresh checkout of the branch at commit 9ce99b7 was manually verified to contain the current YARATHĒKĒ Reader features: category filter, category/series/title grouping, four sort modes, teaching dates, Dominion blue Reader styling, document controls, and Listen controls.

The same clean checkout was verified to contain the current DOME System Command Center source: DOME System Command Center title, static Earth, orbital bands, orbital nodes, and live health/recovery intelligence.

Read and follow docs/deployment/CLOUDFLARE-CLEAN-PREVIEW-RUNBOOK.md.

## Cloudflare context

Two live Workers exist: dome-dashboard and dims-dashboard. Their Wrangler deployment histories must be preserved. Recent live Reader regressions appear downstream of GitHub because the good Reader source remains intact in the repository.

## Codex responsibilities

Work from a fresh repository environment, verify the exact branch and commit used, create only an isolated non-production preview, and perform desktop/mobile verification. If Cloudflare authentication is unavailable, stop and report the blocker rather than redirecting the user into local developer-tool installation.

Verify YARATHĒKĒ teaching load, category headings, category filter, all four sort modes, teaching dates, Reader styling, document controls, and audio controls. Verify DSCC title, centered/static Earth, orbital motion, node readability/contrast, click/tap intelligence interaction, and responsive behavior.

## Hard boundaries

Do not deploy to dome-dashboard. Do not deploy to dims-dashboard. Do not promote a preview. Do not roll back either live Worker. Do not change live Supabase data, authentication/security policy, production traffic routing, or Netlify. Do not merge PR #9 during this task.

## Required return report

Return the exact branch and commit tested, preview Worker/version identifier, preview URL if created, pass/fail results for YARATHĒKĒ and DSCC on desktop and mobile, any build/runtime errors, explicit confirmation that neither live Worker was modified, and one final status: READY FOR CONTROLLED PROMOTION REVIEW or NOT READY.

## Operating rule adopted

For DIMS/DOME, prefer Codex for repository-native implementation, terminal work, dependency checks, test execution, and preview deployment. Keep ChatGPT/user interaction focused on architecture, governance, review, and approval gates. Manual installation of developer tooling on the user’s personal machine is a fallback, not the default path.
