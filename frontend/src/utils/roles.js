export function normalizeRole(role) {
  if (!role || typeof role !== "string") return "";
  return role.trim().toLowerCase().replace(/\s+/g, "");
}
// Check if the user is superadmin.
export function isSuperAdmin(role) {
  return normalizeRole(role) === "superadmin";
}
