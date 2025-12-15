import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import config from "@/config";
import { logApiError } from "./errorLogger";

// use this to interact with our own API (/app/api folder) from the front-end side
const apiClient = axios.create({
  baseURL: "/api",
});

apiClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    let message = "";

    if (error.response?.status === 401) {
      // User not auth, ask to re login
      toast.error("Please login");
      // automatically redirect to /dashboard page after login
      return signIn(undefined, { callbackUrl: config.auth.callbackUrl });
    } else if (error.response?.status === 403) {
      // User not authorized, must subscribe/purchase/pick a plan
      message = "Pick a plan to use this feature";
    } else {
      message =
        error?.response?.data?.error || error.message || error.toString();
    }

    error.message =
      typeof message === "string" ? message : JSON.stringify(message);

    console.error(error.message);

    // Log API errors to backend (except for /logs endpoint to avoid infinite loops)
    const requestUrl = error?.config?.url || "";
    if (!requestUrl.includes("/logs")) {
      // Extract action from URL if possible
      let action = "api_error";
      if (requestUrl.includes("/asset")) {
        action = error?.config?.method === "post" ? "add" : error?.config?.method === "delete" ? "delete" : error?.config?.method === "patch" ? "update" : "fetch";
      } else if (requestUrl.includes("/users")) {
        action = "fetch";
      }
      
      logApiError(error, action).catch(() => {
        // Silently fail - don't break error handling
      });
    }

    // Automatically display errors to the user
    if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("something went wrong...");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
