import apiClient from "./api";

/**
 * Error Logger Utility
 * Captures and logs front-end errors to the backend
 */

// Deduplication: Track recently logged errors to prevent duplicates
const RECENT_ERRORS_KEY = "__recentErrors__";
const DEDUP_WINDOW_MS = 2000; // 2 seconds window

/**
 * Check if this error was recently logged (deduplication)
 */
const isRecentlyLogged = (errorData) => {
  if (typeof window === "undefined") return false;
  
  const recentErrors = window[RECENT_ERRORS_KEY] || [];
  const now = Date.now();
  
  // Create a unique key for this error
  const errorKey = `${errorData.action}:${errorData.errorMessage}:${errorData.errorStack || ""}`;
  
  // Check if this error was logged recently
  const isDuplicate = recentErrors.some(
    (entry) => entry.key === errorKey && now - entry.timestamp < DEDUP_WINDOW_MS
  );
  
  if (!isDuplicate) {
    // Add to recent errors and clean up old entries
    recentErrors.push({ key: errorKey, timestamp: now });
    // Keep only entries from the last 5 seconds
    const filtered = recentErrors.filter(
      (entry) => now - entry.timestamp < 5000
    );
    window[RECENT_ERRORS_KEY] = filtered;
  }
  
  return isDuplicate;
};

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
    // Deduplication: Skip if this error was recently logged
    if (isRecentlyLogged(errorData)) {
      return;
    }

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

// Track if error handlers are already initialized using window property (persists across module reloads)
const INIT_FLAG = "__errorHandlersInitialized__";
const HANDLER_REFS = "__errorHandlerRefs__";

/**
 * Initialize global error handlers
 * This should be called once in the app (e.g., in _app.js or layout)
 * Safe to call multiple times - will only initialize once
 */
export const initializeErrorHandlers = () => {
  if (typeof window === "undefined") return;
  
  // Prevent duplicate initialization using window property (survives module reloads)
  if (window[INIT_FLAG]) {
    return;
  }

  // Handle unhandled promise rejections
  const unhandledRejectionHandler = (event) => {
    logError({
      action: "unhandled_promise_rejection",
      errorType: "error",
      errorMessage: event.reason?.message || String(event.reason),
      errorStack: event.reason?.stack || null,
      additionalData: {
        reason: event.reason,
      },
    });
  };
  
  window.addEventListener("unhandledrejection", unhandledRejectionHandler);

  // Handle global errors
  const errorHandler = (event) => {
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
  };
  
  window.addEventListener("error", errorHandler);

  // Store references for cleanup
  window[HANDLER_REFS] = {
    unhandledRejection: unhandledRejectionHandler,
    error: errorHandler,
  };

  // Mark as initialized
  window[INIT_FLAG] = true;
};

/**
 * Cleanup error handlers (useful for testing or cleanup)
 */
export const cleanupErrorHandlers = () => {
  if (typeof window === "undefined") return;
  
  const refs = window[HANDLER_REFS];
  if (refs) {
    if (refs.unhandledRejection) {
      window.removeEventListener("unhandledrejection", refs.unhandledRejection);
    }
    if (refs.error) {
      window.removeEventListener("error", refs.error);
    }
    delete window[HANDLER_REFS];
  }
  
  delete window[INIT_FLAG];
};
