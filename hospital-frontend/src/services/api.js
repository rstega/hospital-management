const API_BASE_URL = "http://localhost:5000/api";

async function parseResponse(res, fallbackMessage) {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || fallbackMessage);
  }
  return data;
}

function extractArray(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function fetchDoctors(department = "") {
  const query = department ? `?department=${encodeURIComponent(department)}` : "";
  const res = await fetch(`${API_BASE_URL}/doctors${query}`);
  const data = await parseResponse(res, "Failed to load doctors");
  return extractArray(data, "doctors");
}

export async function createDoctor(payload) {
  const res = await fetch(`${API_BASE_URL}/doctors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(res, "Failed to create doctor");
}

export async function fetchAppointments(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const query = params ? `?${params}` : "";
  const res = await fetch(`${API_BASE_URL}/appointments${query}`);
  const data = await parseResponse(res, "Failed to load appointments");
  return extractArray(data, "appointments");
}

export async function createAppointment(payload) {
  const res = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(res, "Failed to book appointment");
}

export async function cancelAppointment(id) {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
    method: "PATCH",
  });
  return parseResponse(res, "Failed to cancel appointment");
}