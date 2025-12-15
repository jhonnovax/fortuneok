/**
 * Checks if a user's email is in the allowed admin emails list
 * The allowed emails are stored in the ALLOWED_ADMIN_EMAILS environment variable
 * as a comma-separated string (e.g., "admin@example.com,user@example.com")
 * 
 * @param {string} email - The email address to check
 * @returns {boolean} - True if the email is authorized, false otherwise
 */
export function isAuthorizedEmail(email) {
  if (!email) {
    return false;
  }

  const allowedEmailsEnv = process.env.ALLOWED_ADMIN_EMAILS;
  
  if (!allowedEmailsEnv) {
    // If no environment variable is set, deny access by default
    return false;
  }

  // Parse comma-separated emails and trim whitespace
  const allowedEmails = allowedEmailsEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

  // Check if the user's email (case-insensitive) is in the allowed list
  return allowedEmails.includes(email.toLowerCase());
}
