export { ROLES, ROLE_PERMISSIONS } from "./roles.js";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden - insufficient permissions",
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input provided",
  SERVER_ERROR: "Internal server error",
  AI_SERVICE_BUSY: "AI service is temporarily busy. Please try again in a few seconds.",
  GEMINI_API_KEY_MISSING: "GEMINI_API_KEY is missing in server/.env"
};

export const VALIDATION_LIMITS = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_KNOWLEDGE_CONTEXT: 12000,
  MAX_DOCUMENT_TEXT_LENGTH: 2500,
  HISTORY_LIMIT: 12
};
