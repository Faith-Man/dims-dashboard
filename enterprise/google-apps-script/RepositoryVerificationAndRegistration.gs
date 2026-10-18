/**
 * =====================================================
 * RepositoryVerificationAndRegistration.gs
 * DIMS-v3.3 Verification and Supabase Registration
 *
 * v1.2
 * Adds idempotent asset_registry upsert behavior and uses the
 * server-side SUPABASE_SERVICE_ROLE_KEY Script Property.
 * =====================================================
 */
function repositoryRegisterArtifactIfAvailable_(operationPayload, params) {
  try {
    params = params || {};

    if (typeof UrlFetchApp === "undefined") {
      return {
        skipped: true,
        reason: "UrlFetchApp unavailable"
      };
    }

    if (
      typeof DIMS_CONFIG === "undefined" ||
      !DIMS_CONFIG.supabase ||
      !DIMS_CONFIG.supabase.projectUrl
    ) {
      return {
        skipped: true,
        reason: "DIMS_CONFIG.supabase unavailable or incomplete"
      };
    }

    const serviceRoleKey = PropertiesService
      .getScriptProperties()
      .getProperty("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceRoleKey) {
      throw new Error(
        "Missing Script Property SUPABASE_SERVICE_ROLE_KEY for RepositoryService Supabase registration."
      );
    }

    const table = params.registryTable || "asset_registry";
    const file = operationPayload.file || {};
    const verification = operationPayload.verification || {};
    const verified = verification.constitutionalStatus === "PERSISTENCE_VERIFIED";
    const assetCode = params.assetCode || params.artifactId || file.id;

    if (!assetCode) {
      throw new Error("Cannot register repository artifact without asset_code.");
    }

    const payload = {
      asset_code: assetCode,
      asset_name: params.assetName || params.artifactName || file.name,
      asset_type: params.assetType || "repository_artifact",
      platform: params.platform || "Google Drive",
      location: params.location || file.url || "DIMS-v3",
      file_name: params.fileName || file.name,
      status: params.status || (verified ? "verified" : "pending_verification"),
      priority: params.priority || "high",
      system_area: params.systemArea || "DIMS-v3 Repository",
      description: params.description ||
        ((operationPayload.operation || "Repository operation") + " via DIMS-v3 RepositoryService")
    };

    const url = DIMS_CONFIG.supabase.projectUrl +
      "/rest/v1/" + table +
      "?on_conflict=asset_code";

    const response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: {
        apikey: serviceRoleKey,
        Authorization: "Bearer " + serviceRoleKey,
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    operationPayload.supabaseRegistration = {
      attempted: true,
      operation: "upsert",
      table: table,
      conflictKey: "asset_code",
      schemaPattern: "asset_registry.asset_code",
      responseCode: responseCode,
      responseBody: responseBody,
      payload: payload
    };

    if (responseCode < 200 || responseCode >= 300) {
      operationPayload.supabaseRegistration.success = false;
      operationPayload.supabaseRegistration.warning =
        "Drive persistence may be verified, but Supabase asset registration requires review.";
    } else {
      operationPayload.supabaseRegistration.success = true;
    }

    return operationPayload.supabaseRegistration;
  } catch (err) {
    operationPayload.supabaseRegistration = {
      attempted: true,
      operation: "upsert",
      success: false,
      error: err.toString(),
      warning: "Repository operation may still be verified in Drive; Supabase registration requires review."
    };
    return operationPayload.supabaseRegistration;
  }
}

function repositoryEnterpriseSuccess_(code, action, message, data) {
  if (typeof enterpriseSuccess === "function") {
    return enterpriseSuccess(code, action, message, data);
  }
  return {
    success: true,
    code: code,
    action: action,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
}

function repositoryEnterpriseFailure_(code, action, err, data) {
  if (typeof enterpriseFailure === "function") {
    return enterpriseFailure(code, action, err.toString(), data);
  }
  return {
    success: false,
    code: code,
    action: action,
    message: err.toString(),
    data: data || {},
    timestamp: new Date().toISOString()
  };
}
