# MED™ Seven-Domain Assessment Redesign — v1

Status: governed assessment-design draft under TASK-0101. Production question catalog is unchanged.

## Purpose
Reduce spouse assessment burden while expanding MED™ from five to seven meaningful domains. Preserve RAD™ Probability × Severity → RAC scoring, spouse-score separation, and counselor-first safety overrides.

## Target instrument
28 questions total:
- Communication — 4
- Finances — 4
- Sexual Intimacy — 4
- Covenant & Trust — 4
- Spiritual Unity & Purpose — 3
- Roles, Responsibilities & Family Stewardship — 3
- Safety — 6

Each spouse answers the same instrument independently. Each item keeps the existing two-part response model:
1. Frequency → RAD Probability
2. Impact on the marriage → RAD Severity

Safety-sensitive items retain override behavior and are never diluted into an averaged couple score.

---

## 1. Communication — 4 questions

**COM-01** — How often do disagreements escalate into yelling, harsh tones, personal attacks, contempt, sarcasm, or belittling?

**COM-02** — How often do you feel unheard, dismissed, misunderstood, interrupted, or unable to finish important conversations with your spouse?

**COM-03** — How often do you avoid, delay, or withhold important conversations or information because you expect conflict, shutdown, or a negative reaction?

**COM-04** — How often do conflicts remain unresolved long enough to reduce affection, encouragement, emotional closeness, or peace in the marriage?

### Consolidation rationale
These four items consolidate the present eight Communication questions while preserving escalation, listening, avoidance, unresolved conflict, and relational impact.

---

## 2. Finances — 4 questions

**FIN-01** — How often are significant financial decisions, spending, debt, accounts, or purchases handled without meaningful agreement or full transparency between you?

**FIN-02** — How often do budgeting, spending, debt, saving, or financial priorities create recurring conflict or unresolved tension?

**FIN-03** — How often does one spouse control financial information, access, or decisions in a way the other experiences as unfair, restrictive, or harmful?

**FIN-04** — How often are agreed financial responsibilities, bills, savings goals, or stewardship commitments neglected or handled inconsistently?

### Consolidation rationale
These four items preserve agreement, secrecy, pressure, control, stewardship, and neglected responsibility from the present seven Finances questions.

---

## 3. Sexual Intimacy — 4 questions

**SEX-01** — How often are you unable to talk openly, respectfully, and safely about sexual intimacy, needs, concerns, expectations, or changes?

**SEX-02** — How often does the current level or pattern of sexual intimacy, affection, rejection, avoidance, or emotional hurt create recurring distress, resentment, or distance?

**SEX-03** — How often do physical, medical, pain, fatigue, emotional, or other health-related concerns affect intimacy without being adequately addressed together?

**SEX-04 — SAFETY OVERRIDE** — How often does sexual pressure, guilt, manipulation, intimidation, coercion, force, threats, or inability to freely consent occur?

### Consolidation rationale
These four items preserve communication, affection/rejection, health-related barriers, and the separate coercion/consent safety trigger from the present seven Sexual Intimacy questions.

---

## 4. Covenant & Trust — 4 questions

**COV-01** — How often do dishonesty, secrecy, broken promises, betrayal, or past offenses continue to damage trust in the marriage?

**COV-02** — How often are unresolved offenses repeatedly brought into current conflict because forgiveness, repentance, repair, or reconciliation remains incomplete?

**COV-03** — How often do you experience disrespect for your dignity, boundaries, contribution, commitments, or place in the marriage?

**COV-04** — How often has separation or divorce been seriously considered, discussed, threatened, or used during conflict?

### Consolidation rationale
Spiritual-direction and responsibility questions move to their own newly governed domains rather than remaining embedded inside Covenant & Trust.

---

## 5. Spiritual Unity & Purpose — 3 questions

**SPU-01** — How often do differences in faith, spiritual direction, biblical convictions, values, or priorities create division between you?

**SPU-02** — How often do you lack meaningful spiritual unity in practices such as prayer, worship, Scripture, church life, or seeking God together?

**SPU-03** — How often do you feel the marriage is hindering rather than strengthening either spouse in becoming who God created them to be and doing what God has called them to do?

### Domain purpose
Measures shared spiritual direction and whether the marriage strengthens or obstructs God-given identity, growth, purpose, and calling.

---

## 6. Roles, Responsibilities & Family Stewardship — 3 questions

**RRF-01** — How often do responsibilities in the marriage, home, family, parenting, provision, or daily life feel seriously unbalanced, unclear, neglected, or unfair?

**RRF-02** — How often do disagreements about roles, authority, decision-making, expectations, or responsibilities create recurring conflict?

**RRF-03** — How often do you believe your spouse is not being strengthened, supported, helped, or equipped by the way you are carrying your responsibilities in the marriage?

### Domain purpose
Measures role clarity, responsibility, mutual strengthening, family stewardship, and whether each spouse is helping the other become stronger rather than adversarial.

---

## 7. Safety — 6 questions

All six remain counselor-first safety overrides.

**SAF-01 — SAFETY OVERRIDE** — How often do you feel afraid of your spouse’s reaction during conflict or when expressing disagreement, needs, or boundaries?

**SAF-02 — SAFETY OVERRIDE** — How often has intimidation occurred, including blocking an exit, destroying property, threatening gestures, stalking, using physical size to frighten, or preventing you from leaving safely?

**SAF-03 — SAFETY OVERRIDE** — How often has physical violence, unwanted physical force, restraint, or assault occurred?

**SAF-04 — SAFETY OVERRIDE** — How often has sexual activity involved force, coercion, threats, intimidation, manipulation, or inability to freely consent?

**SAF-05 — SAFETY OVERRIDE** — How often have credible threats been made to harm you, your spouse, a child, another person, a pet, or property in order to frighten or control?

**SAF-06 — SAFETY OVERRIDE** — How often has a child been directly endangered, used in threats, exposed to severe intimidation or violence, or placed at meaningful risk because of marital conflict?

### Safety rule
A safety disclosure is not treated as an ordinary couple discrepancy. It requires private counselor-first review and can override ordinary joint-session prioritization.

---

## RAD™ / IAM scoring remains unchanged

### Identify
Each question identifies a concrete behavior or condition in one of the seven marriage domains.

### Assess
- Frequency maps to Probability A–E.
- Impact maps to Severity I–V.
- The locked RAD™ matrix produces RAC 1–5.
- Husband and Wife scores remain separate.
- Counselor sees the most serious applicable condition for triage but does not average spouses into one risk score.

### Mitigate
MED™ generates a draft counseling response based on domain, RAC, discrepancy, and safety status. The counselor reviews, edits, approves, rejects, or supplements that draft before it becomes couple-facing guidance.

---

## Biblical architecture
The assessment is not a replacement for Scripture. Its design is governed by the biblical marriage framework already approved for MED™:

- **Genesis 2:18, 21–24** — creation, help meet, and one-flesh union.
- **Matthew 19:4–8** — Jesus returns the marriage question to God’s design “from the beginning.”
- **Ephesians 5:33** — husband to love his wife; wife to reverence her husband.

Primary MED™ governing statement:

**“From the beginning it was not so.” — Matthew 19:8**

---

## Implementation guardrails
1. Do not replace the production `med_question_catalog` until this 28-question instrument is approved.
2. Preserve existing response and score history for the current 34-question instrument.
3. Version the new catalog rather than overwriting historical question definitions.
4. Do not weaken RLS, spouse isolation, or counselor-only score visibility.
5. Retain all six dedicated Safety questions plus SEX-04 as a safety-sensitive item.
6. Re-run Husband/Wife/Counselor acceptance testing after catalog migration.
7. Confirm mobile and desktop usability before production promotion.
