import { HydratedDocument, Types } from "mongoose";
import { IProf, Prof } from "../../src/model/ProfModel";
import { verifyJWT, verifyPasswordAndCreateJWT } from '../../src/services/JWTService';
import jwt from 'jsonwebtoken';

let prof: HydratedDocument<IProf>;
const prevSec = process.env.JWT_SECRET;
const prevTTL = process.env.JWT_TTL;

beforeEach(async () => {
    prof = await Prof.create({
        name: "Joze Mendez",
        campusID: "123m",
        password: "JozeM123"
    });
})
afterEach(() => {
    process.env.JWT_SECRET = prevSec;
    process.env.JWT_TTL = prevTTL;
})

test("verifiziere password und erstelle JWT", async () => {
    const token = await verifyPasswordAndCreateJWT(prof.campusID, "JozeM123");

    expect(token).toBeDefined();

    const decodedToken = jwt.verify(token as string, process.env.JWT_SECRET!);

    expect(decodedToken).toMatchObject({
        id: prof.id,
        role: 'u'
    });

    //Errors
    await expect(verifyPasswordAndCreateJWT(prof.campusID, prof.password)).
        rejects.toThrow("login failed");

    await expect(verifyPasswordAndCreateJWT("12w3", "JozeM123")).
        rejects.toThrow("login failed");

    process.env.JWT_SECRET = '';
    process.env.JWT_TTL = '';

    await expect(verifyPasswordAndCreateJWT('campusID', 'password'))
        .rejects
        .toThrowError('Environment variables JWT_SECRET and JWT_TTL must be defined.');
})

test("verifiziere JWT", async () => {
    const token = await verifyPasswordAndCreateJWT(prof.campusID, "JozeM123");
    const verifiedToken = verifyJWT(token);

    expect(verifiedToken.id).toBe(prof.id);
    expect(verifiedToken.role).toBe("u");
    const ttl = process.env.JWT_TTL;
    const ttlNumber = parseInt(ttl!, 10)
    expect(verifiedToken.exp).toBe(ttlNumber);

    //Errors

    delete process.env.JWT_SECRET;

    expect(() => verifyJWT('some_token')).toThrowError('Environment variable JWT_SECRET must be defined');

    process.env.JWT_SECRET = prevSec;

    expect(() => verifyJWT("")).toThrowError("JWT is undefined or empty");
    expect(() => verifyJWT("33")).toThrowError("Invalid JWT token");
})


