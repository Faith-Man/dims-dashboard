-- TASK-0101 — MED™ versioned assessment catalog
-- Stages MED-2.0 (28-item seven-domain instrument) without activating it.
-- Existing MED-1.0 responses/scores remain intact.

alter table public.med_question_catalog
  add column if not exists instrument_version text not null default 'MED-1.0',
  add column if not exists display_code text;

update public.med_question_catalog
set display_code = question_id
where display_code is null;

alter table public.med_question_catalog
  alter column display_code set not null;

alter table public.med_question_catalog
  drop constraint if exists med_question_catalog_sort_order_key;

alter table public.med_question_catalog
  drop constraint if exists med_question_catalog_instrument_sort_key;
alter table public.med_question_catalog
  add constraint med_question_catalog_instrument_sort_key unique (instrument_version, sort_order);

alter table public.med_question_catalog
  drop constraint if exists med_question_catalog_instrument_display_key;
alter table public.med_question_catalog
  add constraint med_question_catalog_instrument_display_key unique (instrument_version, display_code);

comment on column public.med_question_catalog.instrument_version is
  'Versioned MED assessment instrument. MED-1.0 preserves the original 34-item instrument; MED-2.0 is the seven-domain 28-item redesign.';
comment on column public.med_question_catalog.display_code is
  'Human-facing question code within an instrument version; question_id remains globally unique for historical response integrity.';

alter table public.med_cases
  add column if not exists instrument_version text not null default 'MED-1.0';

comment on column public.med_cases.instrument_version is
  'MED assessment instrument assigned to the case. Existing cases remain MED-1.0; future cases may be assigned MED-2.0 after governed activation.';

alter table public.med_cases
  drop constraint if exists med_cases_instrument_version_check;
alter table public.med_cases
  add constraint med_cases_instrument_version_check
  check (instrument_version in ('MED-1.0','MED-2.0'));

insert into public.med_question_catalog(question_id,display_code,instrument_version,domain,question_text,sort_order,safety_override,active) values
('M2-COM-01','COM-01','MED-2.0','Communication','How often do disagreements escalate into yelling, harsh tones, personal attacks, contempt, sarcasm, or belittling?',1,false,false),
('M2-COM-02','COM-02','MED-2.0','Communication','How often do you feel unheard, dismissed, misunderstood, interrupted, or unable to finish important conversations with your spouse?',2,false,false),
('M2-COM-03','COM-03','MED-2.0','Communication','How often do you avoid, delay, or withhold important conversations or information because you expect conflict, shutdown, or a negative reaction?',3,false,false),
('M2-COM-04','COM-04','MED-2.0','Communication','How often do conflicts remain unresolved long enough to reduce affection, encouragement, emotional closeness, or peace in the marriage?',4,false,false),
('M2-FIN-01','FIN-01','MED-2.0','Finances','How often are significant financial decisions, spending, debt, accounts, or purchases handled without meaningful agreement or full transparency between you?',5,false,false),
('M2-FIN-02','FIN-02','MED-2.0','Finances','How often do budgeting, spending, debt, saving, or financial priorities create recurring conflict or unresolved tension?',6,false,false),
('M2-FIN-03','FIN-03','MED-2.0','Finances','How often does one spouse control financial information, access, or decisions in a way the other experiences as unfair, restrictive, or harmful?',7,false,false),
('M2-FIN-04','FIN-04','MED-2.0','Finances','How often are agreed financial responsibilities, bills, savings goals, or stewardship commitments neglected or handled inconsistently?',8,false,false),
('M2-SEX-01','SEX-01','MED-2.0','Sexual Intimacy','How often are you unable to talk openly, respectfully, and safely about sexual intimacy, needs, concerns, expectations, or changes?',9,false,false),
('M2-SEX-02','SEX-02','MED-2.0','Sexual Intimacy','How often does the current level or pattern of sexual intimacy, affection, rejection, avoidance, or emotional hurt create recurring distress, resentment, or distance?',10,false,false),
('M2-SEX-03','SEX-03','MED-2.0','Sexual Intimacy','How often do physical, medical, pain, fatigue, emotional, or other health-related concerns affect intimacy without being adequately addressed together?',11,false,false),
('M2-SEX-04','SEX-04','MED-2.0','Sexual Intimacy','How often do differences about sexual expectations, initiation, frequency, affection, or boundaries create recurring conflict, resentment, or withdrawal?',12,false,false),
('M2-COV-01','COV-01','MED-2.0','Covenant & Trust','How often do dishonesty, secrecy, broken promises, betrayal, or past offenses continue to damage trust in the marriage?',13,false,false),
('M2-COV-02','COV-02','MED-2.0','Covenant & Trust','How often are unresolved offenses repeatedly brought into current conflict because forgiveness, repentance, repair, or reconciliation remains incomplete?',14,false,false),
('M2-COV-03','COV-03','MED-2.0','Covenant & Trust','How often do you experience disrespect for your dignity, boundaries, contribution, commitments, or place in the marriage?',15,false,false),
('M2-COV-04','COV-04','MED-2.0','Covenant & Trust','How often has separation or divorce been seriously considered, discussed, threatened, or used during conflict?',16,false,false),
('M2-SPU-01','SPU-01','MED-2.0','Spiritual Unity & Purpose','How often do differences in faith, spiritual direction, biblical convictions, values, or priorities create division between you?',17,false,false),
('M2-SPU-02','SPU-02','MED-2.0','Spiritual Unity & Purpose','How often do you lack meaningful spiritual unity in practices such as prayer, worship, Scripture, church life, or seeking God together?',18,false,false),
('M2-SPU-03','SPU-03','MED-2.0','Spiritual Unity & Purpose','How often do you feel the marriage is hindering rather than strengthening either spouse in becoming who God created them to be and doing what God has called them to do?',19,false,false),
('M2-RRF-01','RRF-01','MED-2.0','Roles, Responsibilities & Family Stewardship','How often do responsibilities in the marriage, home, family, parenting, provision, or daily life feel seriously unbalanced, unclear, neglected, or unfair?',20,false,false),
('M2-RRF-02','RRF-02','MED-2.0','Roles, Responsibilities & Family Stewardship','How often do disagreements about roles, authority, decision-making, expectations, or responsibilities create recurring conflict?',21,false,false),
('M2-RRF-03','RRF-03','MED-2.0','Roles, Responsibilities & Family Stewardship','How often does the way responsibilities are carried leave either spouse feeling unsupported rather than strengthened, helped, or equipped?',22,false,false),
('M2-SAF-01','SAF-01','MED-2.0','Safety','How often do you feel afraid of your spouse’s reaction during conflict or when expressing disagreement, needs, or boundaries?',23,true,false),
('M2-SAF-02','SAF-02','MED-2.0','Safety','How often has intimidation occurred, including blocking an exit, destroying property, threatening gestures, stalking, using physical size to frighten, or preventing you from leaving safely?',24,true,false),
('M2-SAF-03','SAF-03','MED-2.0','Safety','How often has physical violence, unwanted physical force, restraint, or assault occurred?',25,true,false),
('M2-SAF-04','SAF-04','MED-2.0','Safety','How often has sexual activity involved force, coercion, threats, intimidation, manipulation, or inability to freely consent?',26,true,false),
('M2-SAF-05','SAF-05','MED-2.0','Safety','How often have credible threats been made to harm you, your spouse, a child, another person, a pet, or property in order to frighten or control?',27,true,false),
('M2-SAF-06','SAF-06','MED-2.0','Safety','How often has a child been directly endangered, used in threats, exposed to severe intimidation or violence, or placed at meaningful risk because of marital conflict?',28,true,false)
on conflict (question_id) do nothing;
