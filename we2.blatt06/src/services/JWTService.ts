import { LoginResource } from "../Resources";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { login } from "./AuthenticationService";

export async function verifyPasswordAndCreateJWT(campusID: string, password: string): Promise<string | undefined> {
    const secret = process.env.JWT_SECRET;
    const ttl = process.env.JWT_TTL;

    if (!secret || !ttl) {
        throw new Error("Environment variables JWT_SECRET and JWT_TTL must be defined.");
    }

    const payload = await login(campusID, password);
    if (!(payload).success) throw new Error("login failed");
    const token = jwt.sign(
        payload,
        secret,
        {
            algorithm: "HS256",
            expiresIn: ttl,
        });
    return token;
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
    if (!jwtString || jwtString === "undefined") {
        throw new Error("JWT is undefined or empty");
    }

    const secret = process.env.JWT_SECRET;
    const exp = Number(process.env.JWT_TTL);

    if (!secret) {
        throw new Error("Environment variable JWT_SECRET must be defined");
    }

    try {
        const decoded = jwt.verify(jwtString, secret) as JwtPayload;

        return {
            id: decoded.id,
            role: decoded.role,
            exp: exp
        };
    } catch (error) {
        throw new JsonWebTokenError("Invalid JWT token");
    }
}
