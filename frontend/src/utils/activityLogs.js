// Activity Logs API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function saveActivityLog({
  action,
  details,
  targetBioId = null,
}) {
  const response = await fetch(`${API_BASE_URL}/api/activity-logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      action_performed: action,
      action_details: details,
      target_bio_id: targetBioId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save activity log.");
  }

  return data;
}

export async function fetchActivityLogs() {
  // Activity Logs fetch (Logs page).
  const response = await fetch(`${API_BASE_URL}/api/activity-logs`, {
    credentials: "include",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch activity logs.");
  }

  return data;
}
