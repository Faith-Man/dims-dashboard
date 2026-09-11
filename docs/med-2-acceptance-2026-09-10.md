# MED™ 2.0 Acceptance Evidence — 2026-09-10

Task: TASK-0101 — Build MED™ — Marriage Evaluation Dome

## Acceptance case
- Case ID: `e3f374b3-d52a-421a-9597-b83f72efe925`
- Title: MED-2.0 Controlled Acceptance
- Instrument: MED-2.0
- Participants copied from the governed MED acceptance identities: Husband, Wife, Counselor.

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
PR #82 now makes the secure spouse runtime and counselor report case-version-aware:
- reads `med_cases.instrument_version`
- filters `med_question_catalog` by that version
- uses dynamic question totals instead of hard-coded 34
- displays version-aware question codes
- preserves counselor-only hidden scoring
- renders the seven-domain RAD™ / IAM report for MED-2.0

## Remaining acceptance gate
Browser rendering and responsive usability still require a deployed non-production preview or other governed test deployment. Production is intentionally untouched. Before MED-2.0 becomes the default for new cases, verify:
1. Husband browser flow shows exactly 28 MED-2.0 questions and no spouse/score leakage.
2. Wife browser flow shows exactly 28 MED-2.0 questions and no spouse/score leakage.
3. Counselor browser flow shows 56 scored responses, one safety review, seven-domain report, and correct version label.
4. Desktop and mobile presentation remain usable.
5. Existing MED-1.0 case continues to load its original 34-question instrument.
