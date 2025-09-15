import express from "express";
import { verifyJWT, verifyPasswordAndCreateJWT } from '../services/JWTService';
import { body, matchedData, param, validationResult } from "express-validator";
import cookieParser from 'cookie-parser';

export const loginRouter = express.Router();

loginRouter.use(cookieParser());

const COOKIE_NAME = process.env.COOKIE_NAME!;
const TTL = parseInt(process.env.JWT_TTL!);


loginRouter.post("/",
    body("campusID").isString().isLength({ min: 1, max: 100 }),
    body("password").isString().isStrongPassword(),
    async (req, res, next) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        const { campusID, password } = matchedData(req) as { campusID: string, password: string };

        try {
            const jwtString = await verifyPasswordAndCreateJWT(campusID, password);
            const decoded = verifyJWT(jwtString);
            res.cookie(COOKIE_NAME, jwtString, {
            httpOnly: true, // cannot be read from JS
            secure: process.env.NODE_ENV === "production", // true on Render, false locally
            sameSite: "none", // required for cross-site
            maxAge: TTL * 1000, // milliseconds, easier than calculating a Date
            });
            
            res.status(201).send({
                id: decoded.id,
                role: decoded.role,
                exp: decoded.exp,
            });


        } catch (err) {
            if (err instanceof Error && err.message.toString() === "Environment variables JWT_SECRET and JWT_TTL must be defined.") {
                res.status(500).send({ error: err.message.toString() });
            }
            if (err instanceof Error && err.message.toString() === "login failed") {
                res.status(401).send({ error:"Ungültige Campus-ID oder Passwort" });
            }
            else if (err instanceof Error ) {
                res.status(500).send({ error: err.message });
            }
            else next(err);
        }
    });

loginRouter.get("/",
    async (req, res, next) => {
        const token = req.cookies[COOKIE_NAME];
        if (!token) {
            return res.status(401).send(false);
        }

        try {

            const decoded = verifyJWT(token);
            
            res.status(200).json({
                id: decoded.id,
                role: decoded.role,
                exp: decoded.exp,
            });

        } catch (err) {
            if (err instanceof Error && err.message.toString() === "JWT is undefined or empty") {
                res.status(400).send({ error: err.message.toString() });
            }
            if (err instanceof Error && err.message.toString() === "Environment variable JWT_SECRET must be defined") {
                res.status(500).send({ error: err.message.toString() });
            }
            if (err instanceof Error && err.message.toString() === "Invalid JWT token") {
                res.status(400).send(false);
            }
            if (err instanceof Error) {
                res.status(400).send(err);
            }
            next(err);
        }
    });

loginRouter.delete("/",
    async (_req, res) => {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        })

        res.status(200).send("Logged out");
    });