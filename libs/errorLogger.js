import apiClient from "./api";

/**
 * Error Logger Utility
 * Captures and logs front-end errors to the backend
 */

/**
 * Log an error to the backend
 * @param {Object} errorData - Error information to log
 * @param {string} errorData.action - Action that caused the error (add, delete, update, etc.)
 * @param {string} errorData.errorMessage - Error message
 * @param {string} [errorData.errorStack] - Error stack trace
 * @param {string} [errorData.errorType] - Type of error (error, warning, info)
 * @param {Object} [errorData.additionalData] - Additional context data
 * @param {number} [errorData.statusCode] - HTTP status code if applicable
 * @param {string} [errorData.requestUrl] - API request URL if applicable
 * @param {string} [errorData.requestMethod] - HTTP method if applicable
 * @param {Object} [errorData.requestBody] - Request body if applicable
 * @param {Object} [errorData.responseData] - Response data if applicable
 */
export const logError = async (errorData) => {
  try {
    // Get current URL
    const url = typeof window !== "undefined" ? window.location.href : "";

    // Get user agent
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";

    // Prepare log payload
    const logPayload = {
      action: errorData.action || "unknown",
      errorType: errorData.errorType || "error",
      errorMessage: errorData.errorMessage || "Unknown error",
      errorStack: errorData.errorStack || null,
      url,
      userAgent,
      additionalData: errorData.additionalData || {},
      statusCode: errorData.statusCode || null,
      requestUrl: errorData.requestUrl || null,
      requestMethod: errorData.requestMethod || null,
      requestBody: errorData.requestBody || null,
      responseData: errorData.responseData || null,
    };

    // Send to backend (fire and forget - don't block user experience)
    apiClient.post("/logs", logPayload).catch((err) => {
      // Silently fail - we don't want error logging to cause more errors
      console.error("Failed to log error to backend:", err);
    });
  } catch (err) {
    // Silently fail - we don't want error logging to cause more errors
    console.error("Error in errorLogger:", err);
  }
};

/**
 * Log an API error
 * @param {Object} error - Axios error object
 * @param {string} action - Action that caused the error
 */
export const logApiError = async (error, action = "api_error") => {
  await logError({
    action,
    errorType: "error",
    errorMessage:
      error?.response?.data?.error ||
      error?.message ||
      error?.toString() ||
      "Unknown API error",
    errorStack: error?.stack || null,
    statusCode: error?.response?.status || null,
    requestUrl: error?.config?.url || null,
    requestMethod: error?.config?.method?.toUpperCase() || null,
    requestBody: error?.config?.data || null,
    responseData: error?.response?.data || null,
    additionalData: {
      baseURL: error?.config?.baseURL,
      headers: error?.config?.headers,
    },
  });
};

/**
 * Log a user action (successful or failed)
 * @param {string} action - Action performed (add, delete, update, fetch)
 * @param {Object} [data] - Additional data about the action
 * @param {boolean} [success=true] - Whether the action was successful
 */
export const logAction = async (action, data = {}, success = true) => {
  await logError({
    action,
    errorType: success ? "info" : "error",
    errorMessage: success
      ? `Action ${action} completed successfully`
      : `Action ${action} failed`,
    additionalData: {
      success,
      ...data,
    },
  });
};

/**
 * Initialize global error handlers
 * This should be called once in the app (e.g., in _app.js or layout)
 */
export const initializeErrorHandlers = () => {
  if (typeof window === "undefined") return;

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logError({
      action: "unhandled_promise_rejection",
      errorType: "error",
      errorMessage: event.reason?.message || String(event.reason),
      errorStack: event.reason?.stack || null,
      additionalData: {
        reason: event.reason,
      },
    });
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    logError({
      action: "global_error",
      errorType: "error",
      errorMessage: event.message || "Unknown error",
      errorStack: event.error?.stack || null,
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });
};
