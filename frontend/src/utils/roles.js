export function normalizeRole(role) {
  if (!role || typeof role !== "string") return "";
  return role.trim().toLowerCase().replace(/\s+/g, "");
}

export function formatRoleLabel(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "superadmin") return "Super Admin";
  if (normalizedRole === "admin") return "Admin";
  if (normalizedRole === "employee") return "Employee";
  if (normalizedRole === "supervisor") return "Supervisor";

  return role || "";
}

// Check if the user is superadmin.
export function isSuperAdmin(role) {
  return normalizeRole(role) === "superadmin";
}
