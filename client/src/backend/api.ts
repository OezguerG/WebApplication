// api.ts
import { ThemaResource, GebietResource, LoginResource, ProfResource } from "../Resources";
import { fetchWithErrorHandling } from "./fetchWithErrorHandling";
import { themen, gebiete } from "./testdata";

// ---- config ----
const API_BASE = (import.meta.env.VITE_API_SERVER_URL?.replace(/\/+$/, "") || "");
const REAL = import.meta.env.PROD || import.meta.env.VITE_REAL_FETCH === "true";

export const MAX_LENGTH_LINE_STRING = 100;
export const MAX_LENGTH_MULTILINE_STRING = 1000;

// Small helper to build URLs
const u = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;

// Small helper to parse error bodies safely
async function parseError(response: Response) {
  try {
    const data = await response.json();
    return data?.error || data?.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

// Shared options for credentialed requests (cookies/session)
const cred: RequestCredentials = "include";

// ---------- Gebiete ----------
export async function getAlleGebiete(): Promise<GebietResource[]> {
  if (!REAL) {
    await new Promise(r => setTimeout(r, 700));
    if (gebiete.length === 0) throw new Error("No gebiete found");
    return gebiete;
  }

  const response = await fetchWithErrorHandling(u("/api/gebiet/alle"), {
    method: "GET",
    credentials: cred,
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getGebiet(gebietId: string): Promise<GebietResource> {
  if (!REAL) {
    await new Promise(r => setTimeout(r, 700));
    const found = gebiete.find(g => g.id === gebietId);
    if (!found) throw new Error(`Kein Gebiet mit ID: ${gebietId} gefunden.`);
    return found;
  }

  const response = await fetchWithErrorHandling(u(`/api/gebiet/${gebietId}`), {
    method: "GET",
    credentials: cred,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function editGebiet(
  id: string,
  name: string,
  beschreibung: string,
  verwalter: string,
  isPublic?: boolean,
  closed?: boolean
): Promise<GebietResource> {
  if (!REAL) return gebiete[0];

  const response = await fetchWithErrorHandling(u(`/api/gebiet/${id}`), {
    method: "PUT",
    credentials: cred,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, beschreibung, public: isPublic, closed, verwalter }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function addGebiet(
  name: string,
  beschreibung: string,
  verwalter: string,
  isPublic?: boolean,
  closed?: boolean
): Promise<GebietResource> {
  if (!REAL) return gebiete[0];

  const response = await fetchWithErrorHandling(u("/api/gebiet/"), {
    method: "POST",
    credentials: cred,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, beschreibung, public: isPublic, closed, verwalter }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function delGebiet(id: string): Promise<void> {
  if (!REAL) return;

  const response = await fetchWithErrorHandling(u(`/api/gebiet/${id}`), {
    method: "DELETE",
    credentials: cred,
  });
  if (!response.ok) throw new Error(await parseError(response));
}

// ---------- Themen ----------
export async function getAlleThemen(gebietId: string): Promise<ThemaResource[]> {
  if (!REAL) {
    await new Promise(r => setTimeout(r, 700));
    const list = themen.filter(t => t.gebiet === gebietId);
    if (list.length === 0) throw new Error("No themen found");
    return list;
  }

  const response = await fetchWithErrorHandling(u(`/api/gebiet/${gebietId}/themen`), {
    method: "GET",
    credentials: cred,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getThema(themaId: string): Promise<ThemaResource> {
  if (!REAL) {
    await new Promise(r => setTimeout(r, 700));
    const found = themen.find(t => t.id === themaId);
    if (!found) throw new Error(`kein Thema mit ID: ${themaId} gefunden.`);
    return found;
  }

  const response = await fetchWithErrorHandling(u(`/api/thema/${themaId}`), {
    method: "GET",
    credentials: cred,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function addThema(
  titel: string,
  beschreibung: string,
  betreuer: string,
  gebiet: string,
  abschluss?: string,
  status?: string
): Promise<ThemaResource> {
  if (!REAL) return themen[0];

  const response = await fetchWithErrorHandling(u("/api/thema"), {
    method: "POST",
    credentials: cred,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titel, beschreibung, abschluss, status, betreuer, gebiet }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function editThema(
  id: string,
  titel: string,
  beschreibung: string,
  status?: string,
  abschluss?: string
): Promise<ThemaResource> {
  if (!REAL) return themen[0];

  const response = await fetchWithErrorHandling(u(`/api/thema/${id}`), {
    method: "PUT",
    credentials: cred,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, titel, beschreibung, abschluss, status }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function delThema(id: string): Promise<void> {
  if (!REAL) return;

  const response = await fetchWithErrorHandling(u(`/api/thema/${id}`), {
    method: "DELETE",
    credentials: cred,
  });
  if (!response.ok) throw new Error(await parseError(response));
}

// ---------- Auth ----------
export async function login(campusID: string, password: string): Promise<LoginResource> {
  if (!REAL) {
    await new Promise(r => setTimeout(r, 700));
    if (campusID === "MM" && password === "M1234")
      return { id: "1", role: "u", exp: Date.now() + 3600 * 1000 } as any;
    if (campusID === "SS" && password === "S1234")
      return { id: "2", role: "a", exp: Date.now() + 3600 * 1000 } as any;
    throw new Error("Ungültige Campus-ID oder Passwort");
  }

  const response = await fetchWithErrorHandling(u("/api/login"), {
    method: "POST",
    credentials: cred,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campusID, password }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function logout(): Promise<void> {
  if (!REAL) {
    await new Promise(r => setTimeout(r, 700));
    return;
  }

  const response = await fetchWithErrorHandling(u("/api/login"), {
    method: "DELETE",
    credentials: cred,
  });
  if (!response.ok) throw new Error(await parseError(response));
}

export async function getLogin(): Promise<LoginResource | false> {
  if (!REAL) {
    await new Promise(r => setTimeout(r, 700));
    return { id: "123", role: "a", exp: 123 };
  }

  const response = await fetchWithErrorHandling(u("/api/login"), {
    method: "GET",
    credentials: cred,
  });

  if (response.status === 401) return false;
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getProf(profId: string): Promise<ProfResource> {
  const response = await fetchWithErrorHandling(u(`/api/prof/${profId}`), {
    method: "GET",
    credentials: cred,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}