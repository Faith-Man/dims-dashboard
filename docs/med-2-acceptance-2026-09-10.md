# MED™ 2.0 Acceptance Evidence — 2026-09-10

Task: TASK-0101 — Build MED™ — Marriage Evaluation Dome

## Acceptance case
- Case ID: `e3f374b3-d52a-421a-9597-b83f72efe925`
- Title: MED-2.0 Controlled Acceptance
- Instrument: MED-2.0
- Participants copied from the governed MED acceptance identities: Husband, Wife, Counselor.

## Institutional authority — 2026-09-11 correction
The authoritative MED governance documents were formalized and verified on Google Drive before the repository derivatives were updated:
- [MED™ User, Counselor & Administrator Guide v1.0](https://docs.google.com/document/d/19SKG82KVaXVgettpnvW5Kknzhs88OjE7J1tdQHYyqPc/edit?usp=drivesdk)
- [MED™ Report Lifecycle & Governance Standard v1.0](https://docs.google.com/document/d/1hC9XA08aJYX_dq9I7HAlJJL-gxYnwVivGiCSpOPpvgI/edit?usp=drivesdk)

Supabase asset registry references: `MED-GOV-0001`, `MED-GOV-0002`. GitHub documentation is a governed derivative and does not supersede Google Drive authority.

## Instrument state
- MED-1.0 preserved at 34 questions.
- MED-2.0 staged/activated at 28 questions for version-aware case loading.
- Existing MED-1.0 controlled case remains bound to MED-1.0.
- MED-2.0 uses seven domains: Communication; Finances; Sexual Intimacy; Covenant & Trust; Spiritual Unity & Purpose; Roles, Responsibilities & Family Stewardship; Safety.

## Synthetic scoring acceptance
A full 28-response synthetic acceptance set was recorded for each spouse in the fresh MED-2.0 case.

Verified database results:
- Husband inputs: 28
- Wife inputs: 28
- Derived RAD score rows: 56
- Safety overrides: 1
- High / Extremely High score rows: 1

This confirms the existing scoring trigger continues to derive Probability, Severity, RAC, category, and safety override for versioned MED-2.0 question IDs.

## RLS / privacy acceptance
Authenticated-role simulation used the actual governed participant user IDs and existing RLS policies.

### Husband simulation
- Own visible inputs: 28
- Wife inputs visible: 0
- Hidden score rows visible: 0
- MED-2.0 questions visible: 28

### Wife simulation
- Own visible inputs: 28
- Husband inputs visible: 0
- Hidden score rows visible: 0

### Counselor simulation
- Visible spouse inputs: 56
- Visible score rows: 56
- Safety reviews visible: 1

Result: spouse isolation and counselor-only score visibility remain intact for the new MED-2.0 acceptance case.

## Runtime implementation
PR #82 makes the secure spouse runtime and counselor report case-version-aware:
- reads `med_cases.instrument_version`
- filters `med_question_catalog` by that version
- uses dynamic question totals instead of hard-coded 34
- displays version-aware question codes
- preserves counselor-only hidden scoring
- renders the seven-domain RAD™ / IAM report for MED-2.0
- supports Generate / Refresh Draft → Save Draft → Approve & Release Report
- keeps private counselor reports separate from released couple reports

## Report lifecycle data/RLS acceptance — 2026-09-11
The controlled MED-2.0 acceptance case was exercised through the report lifecycle using the governed Counselor identity under the authenticated role. No service-role or administrator bypass was used for lifecycle writes.

### Version 1
1. Counselor draft created as `draft` under the governed counselor identity.
2. Counselor wording was edited and saved while the report remained private.
3. Before release, Wife simulation saw 0 private counselor reports and 0 released reports.
4. Counselor approved Version 1 and created the released snapshot.
5. Husband simulation then saw 0 private counselor reports and 1 released report, Version 1, instrument `MED-2.0`.
6. Wife simulation saw the same released visibility boundary and no private counselor report.

### Versioning defect found and corrected
Acceptance review identified that the browser save path would otherwise continue updating an already-approved counselor report. That would make the next release collide with the existing `(case_id, version)` uniqueness rule instead of creating a new released version.

Smallest branch-only repair in `med-report-lifecycle.js`:
- an existing counselor row is updated only while its status is not `approved`;
- if the latest row is already approved, the next save creates the next counselor-report version.

Repair commit: `871be08632e075f2d3f7701bc34eb233abc95474`.

### Version 2 preservation test
1. After Version 1 was released, a Version 2 counselor draft was created.
2. While Version 2 remained a private draft, Husband still saw only released Version 1 and 0 private counselor reports.
3. Version 2 was then approved and released.
4. Wife saw 2 released versions, latest Version 2, and 0 private counselor reports.
5. Released Version 1 retained MD5 `36df7a30a7d06136788991646dd8d274`.
6. Released Version 2 retained MD5 `b6918a06cef87fa4816a8919a4682914`.
7. Each released snapshot hash exactly matched its corresponding approved counselor snapshot, confirming immutable historical snapshot preservation through the controlled test.

## Historical preservation recheck
- Controlled MED-1.0 case `3c31f603-473f-4d33-aed8-e3fb03a49705` remains explicitly bound to `MED-1.0`.
- Controlled MED-2.0 case `e3f374b3-d52a-421a-9597-b83f72efe925` remains explicitly bound to `MED-2.0`.
- No silent instrument migration occurred during report-lifecycle acceptance.

## Remaining acceptance gate
The data/RLS report lifecycle and released-report versioning acceptance now pass. Browser rendering and responsive usability still require the deployed non-production branch preview. Production remains intentionally untouched.

Before TASK-0101 certification, verify in the branch preview:
1. Counselor UI: Generate / Refresh Draft → inspect recommendations → edit → Save Draft → Approve & Release Report.
2. Husband UI: **Report Available**, latest released report visible, no private counselor material.
3. Wife UI: same released-report and privacy behavior.
4. Seven-domain rendering and safety-sensitive presentation are appropriate.
5. Existing MED-1.0 case continues to load its original 34-question instrument.
6. Desktop presentation remains usable.
7. Mobile presentation remains usable.

Do not promote to production until these browser/mobile gates pass and explicit authorization is given.
