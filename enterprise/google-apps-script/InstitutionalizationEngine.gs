/**
 * ==========================================================
 * InstitutionalizationEngine.gs
 * DIMS-v3 Institutionalization Engine
 *
 * v1.2
 *
 * - Preserves idempotent project handling.
 * - Preserves idempotent task handling.
 * - Creates a complete governed institutionalization record.
 * - Hands the record to RepositoryService.
 * - RepositoryService handles Drive persistence,
 *   read-back verification, and asset_registry upsert.
 * ==========================================================
 */

function testInstitutionalizationEngine() {
  return institutionalizeApprovedDecision_({
    decision: {
      title: "Build Institutionalization Engine",
      type: "Infrastructure Engine",
      status: "approved",
      summary: "Create the engine that converts approved Commander decisions into projects, tasks, deployment records, and institutional status.",
      commander_decision: "APPROVED",
      date: "2026-07-01"
    },
    project: {
      title: "Institutionalization Engine",
      status: "in_progress",
      priority: "high",
      stream: "DIMS-v3",
      description: "Build the system that ensures approved ChatGPT decisions become operational enterprise records in DIMS-v3.",
      start_date: "2026-07-01",
      target_date: "2026-07-04",
      percent_complete: 25
    },
    tasks: [
      {
        title: "Generate InstitutionalizationEngine.gs",
        status: "completed",
        priority: "high",
        notes: "Initial institutionalization engine generated in ChatGPT and installed in Apps Script.",
        start_date: "2026-07-01",
        target_date: "2026-07-01",
        percent_complete: 100
      },
      {
        title: "Verify Institutionalization Engine",
        status: "open",
        priority: "high",
        notes: "Run testInstitutionalizationEngine and verify dashboard/Supabase update.",
        start_date: "2026-07-01",
        target_date: "2026-07-02",
        percent_complete: 0
      },
      {
        title: "Commit Institutionalization Engine to GitHub",
        status: "open",
        priority: "high",
        notes: "After verification, save the engine into the external source-control environment.",
        start_date: "2026-07-01",
        target_date: "2026-07-03",
        percent_complete: 0
      }
    ],
    deployment: {
      chatgpt: "approved",
      apps_script: "verified",
      google_drive: "repository_managed",
      github: "pending",
      supabase: "repository_managed",
      netlify: "not_applicable"
    },
    artifact: {
      assetCode: "DIMS-INST-0001",
      title: "DIMS Institutionalization Engine — Institutional Record",
      folderName: "Artifacts",
      mimeType: "google_doc",
      assetType: "institutional_record",
      platform: "Google Drive + Supabase",
      systemArea: "DIMS-v3 Institutionalization",
      priority: "high",
      status: "verified",
      description: "Governed institutional record for the DIMS-v3 Institutionalization Engine."
    }
  });
}

function institutionalizeApprovedDecision_(payload) {
  if (!payload || !payload.project) {
    throw new Error("Missing institutionalization payload.");
  }

  const project = createProject_(payload.project);

  const tasks = (payload.tasks || []).map(function(task) {
    const taskPayload = Object.assign({}, task);
    taskPayload.project_id = project.id;
    return createOrReuseInstitutionalTask_(taskPayload);
  });

  const institutionalRecord = {
    record_type: "DIMS_INSTITUTIONALIZATION_RECORD",
    institutionalization_status: "INSTITUTIONALIZED",
    institutionalized_at: new Date().toISOString(),
    decision: payload.decision || {},
    project: project,
    tasks: tasks,
    deployment: payload.deployment || {},
    governance: {
      repository_policy: "EBYC — Extend Before You Create",
      persistence_policy: "RepositoryService governed persistence",
      registration_policy: "Enterprise Asset ID / asset_registry",
      verification_policy: "Read-back verification required"
    }
  };

  const repositoryResult = institutionalizeRecordToRepository_(
    institutionalRecord,
    payload.artifact || {},
    project
  );

  const routingResult = routeInstitutionalArtifact_(
    Object.assign({}, payload.artifact || {}, {
      title: (payload.artifact && payload.artifact.title)
        ? payload.artifact.title
        : project.title + " — Institutional Record",
      purpose: (payload.artifact && payload.artifact.purpose)
        ? payload.artifact.purpose
        : ((payload.artifact && payload.artifact.description)
          ? payload.artifact.description
          : "institutional record")
    })
  );

  const record = {
    status: "INSTITUTIONALIZED",
    created_at: institutionalRecord.institutionalized_at,
    decision: institutionalRecord.decision,
    project: project,
    tasks: tasks,
    deployment: payload.deployment || {},
    artifact: payload.artifact || {},
    repository: repositoryResult,
    routing: routingResult,
    next_action: "Verify repository persistence and external synchronization requirements."
  };

  Logger.log(JSON.stringify(record, null, 2));
  return record;
}

/**
 * ==========================================================
 * Institutional record → RepositoryService adapter
 * ==========================================================
 */
function institutionalizeRecordToRepository_(institutionalRecord, artifactConfig, project) {
  if (typeof repositoryCreateArtifact !== "function") {
    throw new Error("RepositoryService unavailable: repositoryCreateArtifact() not found.");
  }

  const projectNumber = project.project_number || project.projectNumber || null;
  const assetCode = artifactConfig.assetCode || artifactConfig.artifactId ||
    (projectNumber ? projectNumber + "-INST" : null);

  if (!assetCode) {
    throw new Error("Institutional artifact requires a stable assetCode.");
  }

  const title = artifactConfig.title || (project.title + " — Institutional Record");
  const content = buildInstitutionalRecordContent_(institutionalRecord);

  const repositoryParams = {
    title: title,
    content: content,
    folderName: artifactConfig.folderName || "Artifacts",
    mimeType: artifactConfig.mimeType || "google_doc",
    assetCode: assetCode,
    assetName: artifactConfig.assetName || title,
    assetType: artifactConfig.assetType || "institutional_record",
    platform: artifactConfig.platform || "Google Drive + Supabase",
    systemArea: artifactConfig.systemArea || "DIMS-v3 Institutionalization",
    priority: artifactConfig.priority || "high",
    status: artifactConfig.status || "verified",
    description: artifactConfig.description || ("Governed institutional record for " + project.title + ".")
  };

  const result = repositoryCreateArtifact(repositoryParams);

  if (!result || result.success !== true) {
    throw new Error("Institutional repository persistence failed: " + JSON.stringify(result));
  }

  if (!result.data ||
      !result.data.verification ||
      result.data.verification.constitutionalStatus !== "PERSISTENCE_VERIFIED") {
    throw new Error("Institutional repository read-back verification did not pass.");
  }

  return result;
}

/** Create a readable governed institutional record. */
function buildInstitutionalRecordContent_(record) {
  const lines = [];
  lines.push("DIMS-v3 INSTITUTIONALIZATION RECORD");
  lines.push("=================================");
  lines.push("");
  lines.push("Status: " + record.institutionalization_status);
  lines.push("Institutionalized At: " + record.institutionalized_at);
  lines.push("");
  lines.push("DECISION");
  lines.push("--------");
  lines.push(JSON.stringify(record.decision, null, 2));
  lines.push("");
  lines.push("PROJECT");
  lines.push("-------");
  lines.push(JSON.stringify(record.project, null, 2));
  lines.push("");
  lines.push("TASKS");
  lines.push("-----");
  lines.push(JSON.stringify(record.tasks, null, 2));
  lines.push("");
  lines.push("DEPLOYMENT");
  lines.push("----------");
  lines.push(JSON.stringify(record.deployment, null, 2));
  lines.push("");
  lines.push("GOVERNANCE");
  lines.push("----------");
  lines.push(JSON.stringify(record.governance, null, 2));
  return lines.join("\n");
}

/** Find an existing task under the same project by title. */
function findInstitutionalTaskByTitle_(projectId, title) {
  const query = "project_id=eq." + encodeURIComponent(projectId) +
    "&title=eq." + encodeURIComponent(title) +
    "&select=*";
  const result = supabaseRequest_("tasks", "get", null, query);

  if (result.code >= 200 && result.code < 300 && result.body && result.body.length > 0) {
    return result.body[0];
  }
  return null;
}

/** Reuse an existing institutional task when one already exists. */
function createOrReuseInstitutionalTask_(task) {
  const existing = findInstitutionalTaskByTitle_(task.project_id, task.title);
  if (existing) {
    Logger.log("Task already exists: " + task.title);
    return existing;
  }

  const created = createTask_(task);
  Logger.log("Task created: " + task.title);
  return created;
}

/**
 * Governed non-teaching acceptance case for TASK-0029.
 * Extends the existing Institutionalization Engine under EBYC.
 * Uses ECCOM-001 as the governed source case without overwriting the
 * canonical ECCOM-001 document; the acceptance artifact uses its own
 * stable asset code.
 */
function testInstitutionalizationEngineECCOM001() {
  return institutionalizeApprovedDecision_({
    decision: {
      title: "Institutionalize ECCOM-001 non-teaching governance artifact",
      type: "Governance Acceptance Case",
      status: "approved",
      summary: "Verify that the existing DIMS-v3 Institutionalization Engine can institutionalize a governed non-teaching artifact using ECCOM-001 — Dominion1st Kingdom Governance & Intelligence Framework™ — Draft v0.3 as the acceptance case, while preserving the canonical source and idempotent repository behavior.",
      commander_decision: "APPROVED",
      source_governance_id: "ECCOM-001",
      source_document_title: "Dominion1st Kingdom Governance & Intelligence Framework™ — Draft v0.3",
      date: "2026-09-12"
    },
    project: {
      title: "Institutionalization Engine",
      status: "in_progress",
      priority: "high",
      stream: "DIMS-v3",
      description: "Build the system that ensures approved ChatGPT decisions become operational enterprise records in DIMS-v3.",
      start_date: "2026-07-01",
      target_date: "2026-07-04",
      percent_complete: 50
    },
    tasks: [],
    deployment: {
      chatgpt: "approved",
      apps_script: "verification_run",
      google_drive: "repository_managed",
      github: "pending",
      supabase: "repository_managed",
      netlify: "not_applicable"
    },
    artifact: {
      assetCode: "ECCOM-001-INST-ACCEPTANCE",
      title: "ECCOM-001 — Institutionalization Acceptance Record",
      folderName: "Artifacts",
      mimeType: "google_doc",
      assetType: "institutional_record",
      platform: "Google Drive + Supabase",
      systemArea: "DIMS-v3 Institutionalization",
      priority: "high",
      status: "draft",
      description: "Non-teaching acceptance record proving the existing Institutionalization Engine can process the governed ECCOM-001 case without replacing or overwriting the canonical ECCOM-001 source."
    }
  });
}
