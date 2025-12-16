function getTeacherProjectDetails(projectId, userId) {
  if (!projectId) throw new Error("Missing projectId");
  if (!userId) throw new Error("Missing userId");

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";
  const payload = {
    action: "myprojects",
    payload: {
      project_id: String(projectId),
      user_id: String(userId),
      email_id: "teacher1@gmail.com",
      request: "project_details",
    },
  };

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error("API " + code + ": " + text);

  let out = {};
  try {
    out = JSON.parse(text);
  } catch (e) {
    throw new Error("Bad JSON: " + text);
  }

  const body =
    out && typeof out.body === "string" ? JSON.parse(out.body) : out.body;

  let project =
    (body && body.project) ||
    (Array.isArray(body && body.projects) ? body.projects[0] : null) ||
    out.project ||
    (Array.isArray(out.projects) ? out.projects[0] : null) ||
    (body &&
      body.data &&
      (body.data.project ||
        (Array.isArray(body.data.projects) ? body.data.projects[0] : null))) ||
    null;

  if (!project) {
    (function findProject(o) {
      if (!o || typeof o !== "object" || project) return;
      const looks =
        (o.project_id || o.id) &&
        (o.project_title || o.title) &&
        Array.isArray(o.stages);
      if (looks) {
        project = o;
        return;
      }
      for (const k in o) {
        const v = o[k];
        if (Array.isArray(v)) v.forEach(findProject);
        else findProject(v);
        if (project) return;
      }
    })(body || out);
  }

  if (!project) {
    return {
      statusCode: out.statusCode || 200,
      body: { project: null, debug: body || out },
    };
  }
  if (project && !project.user_id && out.action_response?.user_id) {
    project.user_id = out.action_response.user_id;
  }

  return { statusCode: out.statusCode || 200, body: { project } };
}

function getTeacherProjectsAll() {
  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/dev/invoke";
  const body = {
    action: "myprojects",
    payload: {
      request: "teacher_view_all",
      email_id: "teacher1@gmail.com",
    },
  };

  Logger.log("=== getTeacherProjectsAll ===");
  Logger.log("Payload: " + JSON.stringify(body, null, 2));

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error("API " + code + ": " + text);

  let out;
  try {
    out = JSON.parse(text);
  } catch {
    throw new Error("Bad JSON: " + text);
  }

  let bodyLike =
    out && typeof out.body === "string" ? JSON.parse(out.body) : out.body;
  if (!bodyLike) bodyLike = out.action_response || out;

  Logger.log("=== getTeacherProjectsAll Response ===");
  Logger.log("Status: " + (out.statusCode || out.status || 200));
  Logger.log("Projects count: " + (bodyLike?.projects?.length || 0));

  return { statusCode: out.statusCode || out.status || 200, body: bodyLike };
}

/**
 * Get deletion requests for a teacher
 * @param {String} subjectDomain - The subject domain (e.g., "Science", "Geography")
 * @returns {Object} Response with deletion requests
 */
function getDeletionRequests(subjectDomain) {
  if (!subjectDomain) throw new Error("Missing subjectDomain");

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";
  const body = {
    action: "myprojects",
    payload: {
      request: "delete_request_details_teacher",
      email_id: "teacher1@gmail.com",
      subject_domain: subjectDomain,
    },
  };

  try {
    Logger.log("=== getDeletionRequests START ===");
    Logger.log("Subject Domain: " + subjectDomain);
    Logger.log("Payload: " + JSON.stringify(body, null, 2));

    const res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(body),
      muteHttpExceptions: true,
    });

    const code = res.getResponseCode();
    const text = res.getContentText();

    Logger.log("Response Code: " + code);
    Logger.log("Response Text: " + text);

    if (code < 200 || code >= 300) {
      throw new Error("API " + code + ": " + text);
    }

    let out = {};
    try {
      out = JSON.parse(text);
    } catch (e) {
      throw new Error("Bad JSON: " + text);
    }

    const bodyLike =
      out && typeof out.body === "string" ? JSON.parse(out.body) : out.body;

    Logger.log("=== getDeletionRequests SUCCESS ===");
    return {
      statusCode: out.statusCode || out.status || 200,
      body: bodyLike,
      action_response: out.action_response,
      status: out.status,
    };
  } catch (error) {
    Logger.log("=== getDeletionRequests ERROR ===");
    Logger.log("Error: " + error.toString());
    throw error;
  }
}

/**
 * Approve a deletion request (teacher action)
 * @param {String} requestId - The deletion request ID to approve
 * @param {String} entityType - The entity type ("task" or "stage")
 * @returns {Object} Response with success status
 */
function approveDeletionRequest(requestId, entityType) {
  if (!requestId) throw new Error("Missing requestId");
  if (!entityType) throw new Error("Missing entityType");

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";

  const payload = {
    action: "deleterequest",
    payload: {
      request: "teacher_approve",
      actor: {
        role: "teacher",
        email_id: "teacher1@gmail.com",
      },
      ids: {
        request_id: requestId,
        entity_type: entityType,
      },
    },
  };

  try {
    Logger.log("=== approveDeletionRequest START ===");
    Logger.log("Request ID: " + requestId);
    Logger.log("Entity Type: " + entityType);
    Logger.log("Payload: " + JSON.stringify(payload, null, 2));

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error("API " + responseCode + ": " + responseText);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Bad JSON response: " + responseText);
    }

    Logger.log("=== approveDeletionRequest SUCCESS ===");
    return {
      success: true,
      statusCode: responseCode,
      message: "Deletion request approved successfully",
      data: responseData,
    };
  } catch (error) {
    Logger.log("=== approveDeletionRequest ERROR ===");
    Logger.log("Error: " + error.toString());
    return {
      success: false,
      message: error.message || "Failed to approve deletion request",
    };
  }
}

/**
 * Get gate standards for a project
 * @param {String} projectId - The project ID
 * @param {String} invokerEmail - The email of the invoker (teacher)
 * @returns {Object} Response with gate standards data
 */
function getGateStandards(projectId, invokerEmail) {
  if (!projectId) throw new Error("Missing projectId");
  if (!invokerEmail) throw new Error("Missing invokerEmail");

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";

  const payload = {
    action: "getgatestandards",
    payload: {
      invoker_email: invokerEmail,
      project_id: projectId,
    },
  };

  try {
    Logger.log("=== getGateStandards START ===");
    Logger.log("Project ID: " + projectId);
    Logger.log("Invoker Email: " + invokerEmail);
    Logger.log("Payload: " + JSON.stringify(payload, null, 2));

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error("API " + responseCode + ": " + responseText);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Bad JSON response: " + responseText);
    }

    Logger.log("=== getGateStandards SUCCESS ===");
    return {
      success: true,
      statusCode: responseCode,
      data: responseData,
      action_response: responseData.action_response,
      status: responseData.status,
    };
  } catch (error) {
    Logger.log("=== getGateStandards ERROR ===");
    Logger.log("Error: " + error.toString());
    return {
      success: false,
      message: error.message || "Failed to get gate standards",
    };
  }
}

/**
 * Save gate standards
 * @param {Object} gateStandardsData - The gate standards data to save
 * @returns {Object} Response with success status
 */
function saveGateStandards(gateStandardsData) {
  if (!gateStandardsData) throw new Error("Missing gateStandardsData");
  if (!gateStandardsData.project_id) throw new Error("Missing project_id");
  if (!gateStandardsData.student_id) throw new Error("Missing student_id");
  if (!gateStandardsData.invoker_email) {
    throw new Error("Missing invoker_email");
  }
  if (!gateStandardsData.stages || !Array.isArray(gateStandardsData.stages)) {
    throw new Error("Missing or invalid stages array");
  }

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";

  const payload = {
    action: "savegatestandards",
    payload: {
      student_id: gateStandardsData.student_id,
      invoker_email: gateStandardsData.invoker_email,
      project_id: gateStandardsData.project_id,
      stages: gateStandardsData.stages,
    },
  };

  try {
    Logger.log("=== saveGateStandards START ===");
    Logger.log("Project ID: " + gateStandardsData.project_id);
    Logger.log("Student ID: " + gateStandardsData.student_id);
    Logger.log("Invoker Email: " + gateStandardsData.invoker_email);
    Logger.log("Number of stages: " + gateStandardsData.stages.length);
    Logger.log("Payload: " + JSON.stringify(payload, null, 2));

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error("API " + responseCode + ": " + responseText);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Bad JSON response: " + responseText);
    }

    Logger.log("=== saveGateStandards SUCCESS ===");
    return {
      success: true,
      statusCode: responseCode,
      message: "Gate standards saved successfully",
      data: responseData,
    };
  } catch (error) {
    Logger.log("=== saveGateStandards ERROR ===");
    Logger.log("Error: " + error.toString());
    return {
      success: false,
      message: error.message || "Failed to save gate standards",
    };
  }
}

/**
 * Reject a deletion request (teacher action)
 * @param {String} requestId - The deletion request ID to reject
 * @returns {Object} Response with success status
 */
function rejectDeletionRequest(requestId) {
  if (!requestId) throw new Error("Missing requestId");

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";

  const payload = {
    action: "deleterequest",
    payload: {
      request: "teacher_reject",
      actor: {
        role: "teacher",
        email_id: "teacher1@gmail.com",
      },
      ids: {
        request_id: requestId,
      },
    },
  };

  try {
    Logger.log("=== rejectDeletionRequest START ===");
    Logger.log("Request ID: " + requestId);
    Logger.log("Payload: " + JSON.stringify(payload, null, 2));

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error("API " + responseCode + ": " + responseText);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Bad JSON response: " + responseText);
    }

    Logger.log("=== rejectDeletionRequest SUCCESS ===");
    return {
      success: true,
      statusCode: responseCode,
      message: "Deletion request rejected successfully",
      data: responseData,
    };
  } catch (error) {
    Logger.log("=== rejectDeletionRequest ERROR ===");
    Logger.log("Error: " + error.toString());
    return {
      success: false,
      message: error.message || "Failed to reject deletion request",
    };
  }
}

/**
 * Save teacher's project updates (approve, reject, or save edits)
 * @param {Object} projectData - The full project data object
 * @param {String} status - The new status (e.g., "Approved", "Pending Revision")
 * @returns {Object} Response with success status and message
 */
/**
 * Log the JSON structure for debugging (smart logging to avoid truncation)
 * @param {Object} data - The data object to log
 * @param {String} label - Label for the log entry
 */
function logFullJSON(data, label) {
  try {
    Logger.log("========================================");
    Logger.log("=== " + (label || "JSON LOG") + " ===");
    Logger.log("========================================");
    Logger.log("Timestamp: " + new Date().toISOString());
    Logger.log("");
    
    // First, log a summary of the structure
    Logger.log("--- STRUCTURE SUMMARY ---");
    if (data.project_id) {
      Logger.log("Project ID: " + data.project_id);
    }
    if (data.user_id) {
      Logger.log("User ID: " + data.user_id);
    }
    if (data.stages && Array.isArray(data.stages)) {
      Logger.log("Number of stages: " + data.stages.length);
      data.stages.forEach((stage, idx) => {
        Logger.log("  Stage " + (idx + 1) + ": " + (stage.title || stage.stage_id));
        Logger.log("    - Status: " + (stage.status || "N/A"));
        Logger.log("    - Tasks count: " + (stage.tasks ? stage.tasks.length : 0));
        Logger.log("    - Feedback count: " + (stage.feedback ? stage.feedback.length : 0));
        if (stage.gate && stage.gate.feedback) {
          Logger.log("    - Gate feedback: " + (stage.gate.feedback.length > 50 ? stage.gate.feedback.substring(0, 50) + "..." : stage.gate.feedback));
        }
      });
    }
    Logger.log("");
    
    // Log payload structure if it exists
    if (data.action) {
      Logger.log("--- PAYLOAD STRUCTURE ---");
      Logger.log("Action: " + data.action);
      if (data.payload) {
        Logger.log("Payload keys: " + Object.keys(data.payload).join(", "));
        if (data.payload.submission_type) {
          Logger.log("Submission type: " + data.payload.submission_type);
        }
        if (data.payload.json && data.payload.json.project) {
          Logger.log("Project in payload: Yes");
          Logger.log("Project ID: " + (data.payload.json.project.project_id || "N/A"));
          Logger.log("Stages in payload: " + (data.payload.json.project.stages ? data.payload.json.project.stages.length : 0));
        }
      }
      Logger.log("");
    }
    
    // Log feedback entries specifically (most important part)
    if (data.stages && Array.isArray(data.stages)) {
      Logger.log("--- FEEDBACK ENTRIES ---");
      data.stages.forEach((stage, idx) => {
        if (stage.feedback && Array.isArray(stage.feedback) && stage.feedback.length > 0) {
          Logger.log("Stage " + (idx + 1) + " (" + (stage.title || stage.stage_id) + "):");
          stage.feedback.forEach((fb, fbIdx) => {
            Logger.log("  Feedback " + (fbIdx + 1) + ":");
            Logger.log("    Type: " + (fb.feedback_type || "N/A"));
            Logger.log("    Entity: " + (fb.entity_type || "N/A"));
            Logger.log("    Created by: " + (fb.created_by || "N/A"));
            Logger.log("    Created at: " + (fb.created_at || "N/A"));
            Logger.log("    Comment: " + (fb.comment ? (fb.comment.length > 100 ? fb.comment.substring(0, 100) + "..." : fb.comment) : "N/A"));
          });
        } else if (stage.gate && stage.gate.feedback) {
          Logger.log("Stage " + (idx + 1) + " (" + (stage.title || stage.stage_id) + "):");
          Logger.log("  Gate feedback: " + stage.gate.feedback);
        }
      });
      Logger.log("");
    }
    
    // Try to log full JSON, but limit size to avoid truncation
    const jsonString = JSON.stringify(data, null, 2);
    const maxLogSize = 30000; // Reduced to avoid truncation
    
    if (jsonString.length <= maxLogSize) {
      Logger.log("--- FULL JSON (within size limit) ---");
      Logger.log(jsonString);
    } else {
      Logger.log("--- JSON TOO LARGE TO LOG FULLY ---");
      Logger.log("Total size: " + jsonString.length + " characters");
      Logger.log("Logging first " + maxLogSize + " characters...");
      Logger.log(jsonString.substring(0, maxLogSize));
      Logger.log("... (truncated) ...");
      Logger.log("");
      Logger.log("To see full JSON, check the payload sent to backend in network logs.");
    }
    
    Logger.log("========================================");
    Logger.log("=== END " + (label || "JSON LOG") + " ===");
    Logger.log("========================================");
    Logger.log("");
  } catch (error) {
    Logger.log("ERROR in logFullJSON: " + error.toString());
    Logger.log("Error message: " + error.message);
    try {
      Logger.log("Attempting to log data summary...");
      Logger.log("Data type: " + typeof data);
      Logger.log("Data keys: " + (data && typeof data === "object" ? Object.keys(data).join(", ") : "N/A"));
    } catch (e) {
      Logger.log("Could not log data summary");
    }
  }
}

function saveTeacherProjectUpdate(projectData, status) {
  if (!projectData) throw new Error("Missing projectData");
  if (!projectData.project_id) throw new Error("Missing project_id");
  if (!projectData.user_id) throw new Error("Missing user_id");

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";

  try {
    Logger.log("=== saveTeacherProjectUpdate START ===");
    Logger.log(
      "Input projectData keys: " + Object.keys(projectData).join(", ")
    );
    Logger.log("Input status: " + status);
    Logger.log("Input project_id: " + projectData.project_id);
    Logger.log("Input user_id: " + projectData.user_id);
    
    // Log the full incoming project data
    logFullJSON(projectData, "INCOMING PROJECT DATA");

    // Add status to project data if provided (null means preserve existing status)
    // Deep clone projectData to avoid mutating the original
    const projectToSave = JSON.parse(JSON.stringify(projectData));
    if (status !== null && status !== undefined) {
      projectToSave.status = status;
      Logger.log("Status added to project: " + status);
    } else {
      Logger.log("Status preserved: " + (projectToSave.status || "none"));
    }

    Logger.log(
      "Project to save keys: " + Object.keys(projectToSave).join(", ")
    );
    if (projectToSave.stages && Array.isArray(projectToSave.stages)) {
      Logger.log("Number of stages: " + projectToSave.stages.length);
      projectToSave.stages.forEach((stage, idx) => {
        Logger.log(
          "Stage " +
            idx +
            " - stage_id: " +
            (stage.stage_id || "missing") +
            ", title: " +
            (stage.title || "missing") +
            ", teacher_review_status: " +
            (stage.teacher_review_status || "none")
        );
      });
    }

    // Prepare the payload according to saveproject action format
    const payload = {
      action: "saveproject",
      payload: {
        json: {
          project: projectToSave,
        },
        user_id: String(projectData.user_id),
        email_id: "teacher1@gmail.com",
        generatedAt: new Date().toISOString(),
      },
    };

    // Log the full payload JSON
    logFullJSON(payload, "PROJECT UPDATE PAYLOAD");

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    // Make the API call to the backend
    Logger.log("Sending request to: " + url);
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("=== API RESPONSE ===");
    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error("API " + responseCode + ": " + responseText);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      Logger.log(
        "Parsed response data keys: " + Object.keys(responseData).join(", ")
      );
      if (responseData.action_response) {
        Logger.log(
          "action_response keys: " +
            Object.keys(responseData.action_response).join(", ")
        );
      }
    } catch (e) {
      Logger.log("ERROR: Failed to parse response as JSON: " + e.toString());
      throw new Error("Bad JSON response: " + responseText);
    }

    // Return success response
    Logger.log("=== SUCCESS ===");
    Logger.log("Returning success response");
    Logger.log("=== saveTeacherProjectUpdate END ===");

    return {
      success: true,
      statusCode: responseCode,
      message:
        responseData.action_response?.response ||
        "Project updated successfully!",
      data: responseData,
    };
  } catch (error) {
    Logger.log("=== ERROR in saveTeacherProjectUpdate ===");
    Logger.log("Error type: " + error.toString());
    Logger.log("Error message: " + error.message);
    console.error("Error in saveTeacherProjectUpdate:", error);

    // Handle different types of errors
    if (
      error.toString().includes("DNS error") ||
      error.toString().includes("network")
    ) {
      return {
        success: false,
        message:
          "Network connection error. Please check your internet connection.",
      };
    } else if (error.toString().includes("timeout")) {
      return {
        success: false,
        message: "Request timed out. Please try again.",
      };
    } else {
      return {
        success: false,
        message:
          error.message ||
          "An unexpected error occurred. Please contact support if the problem persists.",
      };
    }
  }
}

/**
 * Send teacher feedback at stage level
 * @param {Object} projectData - The project data with stages containing feedback
 * @param {String} teacherEmail - The email of the teacher (defaults to "teacher1@gmail.com")
 * @returns {Object} Response with success status
 */
function sendTeacherStageFeedback(projectData, teacherEmail) {
  if (!projectData) throw new Error("Missing projectData");
  if (!projectData.project_id) throw new Error("Missing project_id");
  if (!projectData.user_id) throw new Error("Missing user_id");

  const email = teacherEmail || "teacher1@gmail.com";
  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke";

  try {
    Logger.log("=== sendTeacherStageFeedback START ===");
    Logger.log("Project ID: " + projectData.project_id);
    Logger.log("User ID: " + projectData.user_id);
    Logger.log("Teacher Email: " + email);
    
    // Log the full incoming feedback project data
    logFullJSON(projectData, "INCOMING FEEDBACK PROJECT DATA");

    // Ensure no tasks are included in the feedback payload to prevent duplication
    const cleanProjectData = JSON.parse(JSON.stringify(projectData));
    if (cleanProjectData.stages && Array.isArray(cleanProjectData.stages)) {
      cleanProjectData.stages = cleanProjectData.stages.map((stage) => {
        const cleanStage = {
          stage_id: stage.stage_id,
          title: stage.title,
          status: stage.status,
          stage_order: stage.stage_order,
          created_at: stage.created_at,
        };
        
        // Only include feedback array, explicitly exclude tasks
        if (stage.feedback && Array.isArray(stage.feedback)) {
          cleanStage.feedback = stage.feedback;
        }
        
        // Log warning if tasks were found (shouldn't happen but good to know)
        if (stage.tasks) {
          Logger.log("WARNING: Tasks found in feedback payload for stage " + stage.stage_id + " - excluding them");
        }
        
        return cleanStage;
      });
    }

    // Prepare payload in the exact format specified by the user
    // The structure matches: submission_type, user_id, email_id, generatedAt, json
    const payload = {
      submission_type: "teacher_feedback",
      user_id: String(cleanProjectData.user_id),
      email_id: email,
      generatedAt: new Date().toISOString(),
      json: {
        project: cleanProjectData,
      },
    };

    // Log the full feedback payload JSON
    logFullJSON(payload, "TEACHER FEEDBACK PAYLOAD");
    
    // Wrap in action/payload structure for postToBackend compatibility
    const backendPayload = {
      action: "saveproject",
      payload: payload,
    };
    
    // Log the final backend payload structure
    logFullJSON(backendPayload, "FINAL BACKEND PAYLOAD (with action wrapper)");

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(backendPayload),
      muteHttpExceptions: true,
    };

    Logger.log("Sending request to: " + url);
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("=== API RESPONSE ===");
    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error("API " + responseCode + ": " + responseText);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      Logger.log(
        "Parsed response data keys: " + Object.keys(responseData).join(", ")
      );
    } catch (e) {
      Logger.log("ERROR: Failed to parse response as JSON: " + e.toString());
      throw new Error("Bad JSON response: " + responseText);
    }

    Logger.log("=== sendTeacherStageFeedback SUCCESS ===");
    return {
      success: true,
      statusCode: responseCode,
      message: "Teacher feedback sent successfully",
      data: responseData,
    };
  } catch (error) {
    Logger.log("=== ERROR in sendTeacherStageFeedback ===");
    Logger.log("Error type: " + error.toString());
    Logger.log("Error message: " + error.message);
    console.error("Error in sendTeacherStageFeedback:", error);

    return {
      success: false,
      message:
        error.message ||
        "An unexpected error occurred while sending feedback. Please try again.",
    };
  }
}

/**
 * Delete a gate standard (teacher action)
 * @param {String} gateStandardId - The gate standard ID to delete
 * @param {String} invokerEmail - The email of the teacher
 * @returns {Object} Response with success status
 */
function deleteGateStandard(gateStandardId, invokerEmail) {
  if (!gateStandardId) throw new Error("Missing gateStandardId");
  if (!invokerEmail) throw new Error("Missing invokerEmail");

  const url =
    "https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/dev/invoke";

  const payload = {
    action: "deleterequest",
    payload: {
      request: "teacher_delete_gate_standard",
      actor: {
        role: "teacher",
        email_id: "teacher1@gmail.com",
      },
      gate_standard: gateStandardId,
    },
  };

  try {
    Logger.log("=== deleteGateStandard START ===");
    Logger.log("Gate Standard ID: " + gateStandardId);
    Logger.log("Invoker Email: " + invokerEmail);
    Logger.log("Payload: " + JSON.stringify(payload, null, 2));

    const options = {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error("API " + responseCode + ": " + responseText);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Bad JSON response: " + responseText);
    }

    Logger.log("=== deleteGateStandard SUCCESS ===");
    return {
      success: true,
      statusCode: responseCode,
      message: "Gate standard deleted successfully",
      data: responseData,
    };
  } catch (error) {
    Logger.log("=== deleteGateStandard ERROR ===");
    Logger.log("Error: " + error.toString());
    return {
      success: false,
      message: error.message || "Failed to delete gate standard",
    };
  }
}
