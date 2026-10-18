/**
 * EnterpriseWorkRegistry.gs
 * Dominion1st DIMS-v3
 * Creates/updates Projects and Tasks in Supabase.
 */
function workRegistryConfig() {
  const key = PropertiesService
    .getScriptProperties()
    .getProperty('SUPABASE_SERVICE_ROLE_KEY');

  if (!key) {
    throw new Error(
      'Missing Script Property SUPABASE_SERVICE_ROLE_KEY for Enterprise Work Registry.'
    );
  }

  return {
    url: DIMS_CONFIG.supabase.projectUrl,
    key: key
  };
}

function supabaseRequest_(table, method, payload, query, requestConfig) {
  const cfg = requestConfig || workRegistryConfig();
  let url = cfg.url + "/rest/v1/" + table;
  if (query) url += "?" + query;

  const options = {
    method: method,
    contentType: "application/json",
    headers: {
      apikey: cfg.key,
      Authorization: "Bearer " + cfg.key,
      Prefer: "return=representation"
    },
    muteHttpExceptions: true
  };

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());

  return {
    code: response.getResponseCode(),
    body: response.getContentText()
      ? JSON.parse(response.getContentText())
      : null
  };
}

function findProjectByTitle_(title) {
  const query = "title=eq." + encodeURIComponent(title) + "&select=*";
  const result = supabaseRequest_("projects", "get", null, query);
  if (result.body && result.body.length > 0) {
    return result.body[0];
  }
  return null;
}

function createProject_(project) {
  const existing = findProjectByTitle_(project.title);
  if (existing) {
    Logger.log("Project already exists: " + project.title);
    return existing;
  }

  const result = supabaseRequest_("projects", "post", project, null);
  if (
    result.code >= 200 &&
    result.code < 300 &&
    result.body &&
    result.body.length > 0
  ) {
    return result.body[0];
  }

  throw new Error("Project insert failed: " + project.title);
}

function createTask_(task) {
  const result = supabaseRequest_("tasks", "post", task, null);
  if (result.code >= 200 && result.code < 300) {
    return result.body ? result.body[0] : result;
  }
  throw new Error("Task insert failed: " + task.title);
}

function seedDeferredWorkItems() {
  const projects = [
    {
      title: "Mission Progress Standard (MPS-0001)",
      status: "deferred",
      priority: "high",
      stream: "Governance",
      description: "Formalize live mission progress tracking, governance phase visibility, resume points, and completion percentages.",
      start_date: "2026-06-27",
      target_date: "2026-06-28"
    },
    {
      title: "Mission Control Dashboard Widget",
      status: "deferred",
      priority: "high",
      stream: "Dashboard",
      description: "Create a Mission Control widget showing mission progress, phase, current task, next authorized action, and resume point.",
      start_date: "2026-06-29",
      target_date: "2026-07-01"
    },
    {
      title: "Enterprise Lifecycle Engine Enhancement",
      status: "deferred",
      priority: "high",
      stream: "System Architecture",
      description: "Enhance artifact lifecycle flow for create, classify, register, store, index, synchronize, and present.",
      start_date: "2026-07-02",
      target_date: "2026-07-05"
    },
    {
      title: "Folder Registry",
      status: "deferred",
      priority: "medium",
      stream: "System Architecture",
      description: "Create centralized folder registry so scripts reference governed folder IDs instead of hard-coded folder names.",
      start_date: "2026-07-06",
      target_date: "2026-07-07"
    },
    {
      title: "Synchronization Engine Enhancements",
      status: "deferred",
      priority: "high",
      stream: "Synchronization",
      description: "Improve Google Drive, Supabase, GitHub, and Netlify synchronization rules for governed artifacts.",
      start_date: "2026-07-08",
      target_date: "2026-07-11"
    },
    {
      title: "Projects & Tasks Synchronization Verification",
      status: "deferred",
      priority: "high",
      stream: "Operations",
      description: "Verify Supabase projects/tasks synchronization and dashboard display pipeline.",
      start_date: "2026-07-12",
      target_date: "2026-07-13"
    }
  ];

  const created = [];
  projects.forEach(function(project) {
    const projectRecord = createProject_(project);
    created.push(projectRecord);
    createTask_({
      project_id: projectRecord.id,
      title: "Initialize " + project.title,
      status: "open",
      priority: project.priority,
      notes: project.description,
      start_date: project.start_date,
      target_date: project.target_date
    });
  });

  Logger.log("Deferred work items seeded.");
  Logger.log(JSON.stringify(created, null, 2));
  return created;
}
