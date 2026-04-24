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

// Activity Logs fetch (Logs page) with server-side pagination + filters.
// Returns { items, total, page, pageSize, totalPages }.
export async function fetchActivityLogs(params = {}, { signal } = {}) {
  const allowed = [
    "page",
    "pageSize",
    "search",
    "action",
    "userId",
    "bioId",
    "from",
    "to",
  ];

  const query = new URLSearchParams();
  for (const key of allowed) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  const qs = query.toString();
  const url = `${API_BASE_URL}/api/activity-logs${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
    credentials: "include",
    signal,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch activity logs.");
  }

  return data;
}

export async function fetchActivityLogFilters({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/activity-logs/filters`, {
    credentials: "include",
    signal,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch activity log filters.");
  }

  return data;
}
