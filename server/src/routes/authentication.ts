import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        export interface Request {
            /**
             * Mongo-ID of currently logged in prof; or undefined, if prof is a guest.
             */
            profId?: string;
            role?: "u" | "a";
        }
    }
}

/**
 * Prüft Authentifizierung und schreibt `profId` und `role' des Profs in den Request.
 * Falls Authentifizierung fehlschlägt, wird ein Fehler (401) gesendet.
 */
export function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies["access_token"];

    if (!token) {
        return res.status(401).send("Authentication token is missing." );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: "u" | "a" };
        req.profId = decoded.id;
        req.role = decoded.role;

        next();
    } catch (err) {
        return res.status(401).send("Invalid or expired token");
    }
}

/**
 * Prüft Authentifizierung und schreibt `profId` und `role' des Profs in den Request.
 * Falls ein JWT vorhanden ist, wird bei fehlgeschlagener Prüfung ein Fehler gesendet.
 * Ansonsten wird kein Fehler erzeugt.
 */
export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies["access_token"];

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: "u" | "a" };
        req.profId = decoded.id;
        req.role = decoded.role;
        next();
    } catch (err) {
        return next();
    }
}

