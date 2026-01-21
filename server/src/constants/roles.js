export const ROLES = {
  USER: "user",
  ADMIN: "admin"
};

export const ROLE_PERMISSIONS = {
  admin: ["upload_documents", "delete_documents", "manage_users", "view_analytics"],
  user: ["send_messages", "view_history"]
};
