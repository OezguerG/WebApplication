import { ThemaResource, GebietResource, LoginResource } from "../Resources";
import { fetchWithErrorHandling } from "./fetchWithErrorHandling";
import { themen, gebiete } from "./testdata";

export const MAX_LENGTH_LINE_STRING = 100;
export const MAX_LENGTH_MULTILINE_STRING = 1000;

export async function getAlleGebiete(): Promise<GebietResource[]> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));

    if (gebiete.length === 0) {
      throw new Error("No gebiete found");
    }

    return Promise.resolve(gebiete);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/gebiet/alle`, {
        method: 'GET',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Gebiete:", error);
      throw error;
    }
  }
}

export async function getGebiet(gebietId: string): Promise<GebietResource> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));

    for (const gebiet of gebiete) {
      if (gebiet.id == gebietId) {
        return Promise.resolve(gebiet);
      }
    }
    throw Error(`Kein Gebiet mit ID: ${gebietId} gefunden.`);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/gebiet/${gebietId}`, {
        method: 'GET',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim Abrufen des Gebiets:", error);
      throw error;
    }
  }
}

export async function editGebiet(id: string, name: string, beschreibung: string, verwalter: string, isPublic?: boolean, closed?: boolean): Promise<GebietResource> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    return Promise.resolve(gebiete[0]);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/gebiet/${id}`, {
        method: 'PUT',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, beschreibung, public: isPublic, closed, verwalter}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim ändern des Gebiets:", error);
      throw error;
    }
  }
}

export async function addGebiet( name: string, beschreibung: string, verwalter: string, isPublic?: boolean, closed?: boolean): Promise<GebietResource> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    return Promise.resolve(gebiete[0]);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/gebiet/`, {
        method: 'POST',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, beschreibung, public: isPublic, closed, verwalter}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim hinzufügen des Gebiets:", error);
      throw error;
    }
  }
}

export async function delGebiet(id: string): Promise<any> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    return Promise.resolve();
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/gebiet/${id}`, {
        method: 'DELETE',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      return Promise.resolve("Gebiet Deleted");
    } catch (error) {
      console.error("Fehler beim löschen des Themas:", error);
      throw error;
    }
  }
}

export async function getAlleThemen(gebietId: string): Promise<ThemaResource[]> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));
    let themenFound: ThemaResource[] = [];
    for (const thema of themen) {
      if (thema.gebiet == gebietId) {
        themenFound.push(thema);
      }
    }
    if (themenFound.length === 0) {
      throw new Error("No themen found");
    }

    return Promise.resolve(themenFound);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/gebiet/${gebietId}/themen`, {
        method: 'GET',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Themen:", error);
      throw error;
    }
  }
}

export async function getThema(themaId: string): Promise<ThemaResource> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));

    for (const thema of themen) {
      if (thema.id == themaId) {
        return Promise.resolve(thema);
      }
    }
    throw Error(`kein Thema mit ID: ${themaId} gefunden.`);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/thema/${themaId}`, {
        method: 'GET',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim Abrufen des Themas:", error);
      throw error;
    }
  }
}

export async function addThema(titel: string, beschreibung: string, betreuer: string, gebiet: string, abschluss?: string, status?: string): Promise<ThemaResource> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    return Promise.resolve(themen[0]);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/thema`, {
        method: 'POST',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titel, beschreibung, abschluss, status, betreuer, gebiet }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Themas:", error);
      throw error;
    }
  }
}

export async function editThema(id: string, titel: string, beschreibung: string, status?: string, abschluss?: string): Promise<ThemaResource> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    return Promise.resolve(themen[0]);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/thema/${id}`, {
        method: 'PUT',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, titel, beschreibung, abschluss, status}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim ändern des Themas:", error);
      throw error;
    }
  }
}

export async function delThema(id: string): Promise<any> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    return Promise.resolve();
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/thema/${id}`, {
        method: 'DELETE',
        credentials: "include" as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      return Promise.resolve("Thema Deleted");
    } catch (error) {
      console.error("Fehler beim löschen des Themas:", error);
      throw error;
    }
  }
}

export async function login(campusID: string, password: string): Promise<any> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));

    if (campusID === "MM" && password === "M1234") {
      return Promise.resolve({
        id: 1,
        role: "u",
        exp: Date.now() + 3600 * 1000,
      });
    } else if (campusID === "SS" && password === "S1234") {
      return Promise.resolve({
        id: 2,
        role: "a",
        exp: Date.now() + 3600 * 1000,
      });
    }else {
      throw new Error("Ungültige Campus-ID oder Passwort");
    }
  } else {
    try {
      
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/login`, {
        method: "POST",
        credentials: "include" as RequestCredentials,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campusID, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim Login:", error);
      throw error;
    }
  }
}

export async function logout(): Promise<any> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));
    return Promise.resolve("u");

  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/login`, {
        method: "DELETE",
        credentials: "include" as RequestCredentials,
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("logout Failed");
      }
      return;
    } catch (error: any) {
      console.error("Fehler beim Logout:", error);
      throw error;
    }
  }
}

export async function getLogin(): Promise<LoginResource | false> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));
    return Promise.resolve({
      id: "123",
      role: "a",
      exp: 123});

  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/login`, {
        method: "GET",
        credentials: "include" as RequestCredentials,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error("Fehler bei get Login:", error);
      throw error;
    }
  }
}
/*
export async function getProfs(): Promise<ProfResource[]> {
  if (import.meta.env.VITE_REAL_FETCH !== 'true') {
    await new Promise(r => setTimeout(r, 700));

    if (profs.length === 0) {
      throw new Error("No profs found");
    }

    return Promise.resolve(profs);
  } else {
    try {
      const response = await fetchWithErrorHandling(`${import.meta.env.VITE_API_SERVER_URL}/api/prof/alle`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Profs:", error);
      throw error;
    }
  }
}
*/