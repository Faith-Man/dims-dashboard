# RB-001-05 Netlify Configuration Recovery

Status: IN PROGRESS  
Program: RB-001 Backup & Recovery  
Control: RB-001-05 Netlify Configuration Recovery  
Established: 2026-08-15

## Objective

Preserve the source-controlled Netlify configuration required to reconstruct the DIMS/DOME deployment without copying secret values, and define the isolated verification boundary required for certification.

## Preserved source configuration

Authoritative sources on `Faith-Man/dims-dashboard` `main`:

- repository-root `netlify.toml`
- `netlify/functions/orai.js`
- repository-root static site content and `_redirects`

Verified source configuration currently declares:

- publish directory: repository root (`.`)
- Functions directory: `netlify/functions`
- OrEl serverless function: `netlify/functions/orai.js`
- OpenAI credential lookup: runtime environment variable `OPENAI_API_KEY`
- no secret value is stored in the function source

These values are recoverable from version control and must not be duplicated into a second configuration authority.

## Secrets and credentials

Secret values are intentionally excluded from this document and source control. Recovery follows `RB-001-06-CONFIGURATION-SECRETS-RECOVERY.md`: restore governed configuration from source, then reissue or re-bind required provider credentials through Netlify's secure runtime environment-variable path. Evidence may record secret names and verification outcomes only, never values.

## Reconstruction procedure

1. Start from a verified clone or bundle restoration of `Faith-Man/dims-dashboard`.
2. Confirm `netlify.toml`, `_redirects`, and `netlify/functions/orai.js` are present and readable.
3. Create or select an isolated/non-production Netlify recovery target.
4. Connect the isolated target to the verified recovery source.
5. Confirm the build publishes from `.` and functions resolve from `netlify/functions`.
6. Re-establish required runtime environment variables through Netlify's secure configuration path; never write secret values into committed files.
7. Deploy to the isolated target.
8. Verify representative static pages load successfully.
9. Verify the OrEl function is deployed and responds to a non-destructive request.
10. Confirm the runtime obtains `OPENAI_API_KEY` only from provider-managed environment configuration when live upstream execution is required.
11. Record target identifier, deployment result, build result, function verification, configuration read-back, and any exceptions in `RB-001-10-RECOVERY-EVIDENCE-AUDIT-RECORD.md`.

## Current verification

Source preservation is VERIFIED: `netlify.toml` is present on `main` and declares the publish root and functions directory; `netlify/functions/orai.js` is present and reads `OPENAI_API_KEY` from the runtime environment rather than source control.

Existing non-production deployment evidence is also VERIFIED: Netlify's Git integration reported a successful Deploy Preview for PR #9 at commit `ac805cc402a5d54a0f3ca27c6384edbbb1ac7805`, including the `dominion1st` preview target `deploy-preview-9--dominion1st.netlify.app`. Additional preview targets were also produced for the same commit. This demonstrates that the governed source can be built and deployed to isolated/non-production Netlify preview infrastructure without promoting the branch to production.

Certification remains IN PROGRESS because direct functional read-back of the recovery preview is still required: representative static-page response verification and a non-destructive response from `/.netlify/functions/orai`. Live OpenAI execution is not required for this recovery check and must not be invoked merely to certify the control, thereby avoiding unnecessary upstream cost. The source inspection already verifies that any live upstream credential is obtained from provider-managed `OPENAI_API_KEY` rather than committed source.

## Certification rule

Mark RB-001-05 COMPLETE only after both conditions are true:

1. required recoverable Netlify configuration is preserved in governed source; and
2. an isolated/non-destructive reconstruction has been successfully deployed and functionally verified.
