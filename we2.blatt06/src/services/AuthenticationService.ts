import { Prof } from "../model/ProfModel";
/**
 * Prüft Campus-ID und Passwort, bei Erfolg ist `success` true 
 * und es wird die `id` und `role` ("u" oder "a") des Profs zurückgegeben
 * 
 * Falls kein Prof mit gegebener Campus-ID existiert oder das Passwort falsch ist, wird nur 
 * `success` mit falsch zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(campusID: string, password: string): Promise<{ success: true, id: string, role: "a" | "u" } | { success: false }> {

    try {
        const prof = await Prof.findOne({ campusID: campusID }).exec();
        if (!prof) {
            return { success: false };
        }
        const isPasswordValid = await prof!.isCorrectPassword(password);

        if (!isPasswordValid) {
            return { success: false };
        }
        const profRole = prof.admin ? "a" : "u";

        return { success: true, id: prof._id.toString(), role: profRole };

    } catch (error) {
        return { success: false };
    }
}