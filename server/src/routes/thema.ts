import express from "express";
import { ThemaResource } from "../Resources";
import { createThema, deleteThema, getThema, updateThema } from "../services/ThemaService";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { getGebiet } from "../services/GebietService";

export const themaRouter = express.Router();

themaRouter.get("/:id",
    optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        try {
            const thema = await getThema(req.params!.id);
            const gebiet = await getGebiet(thema.gebiet);
            if (gebiet.public || req.profId === gebiet.verwalter || req.profId === thema.betreuer) {
                res.send(thema); // Default Status 200
            }
            else res.status(403).send("thema kann nur vom Verwalter oder betreuer " +
                "des Gebiets selbst angefragt werden wenn diese nicht öffentlich sind")
        } catch (err) {
            if (err instanceof Error && err.message.toString() === "Thema with that ID probably doesnt exist") {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(404).send({ errors: errors });
            }
            else next(err);
        }
    });

themaRouter.post("/",
    requiresAuthentication,
    body("titel").isString().isLength({ min: 1, max: 100 }),
    body("beschreibung").isString().isLength({ min: 1, max: 1000 }),
    body("abschluss").isString().optional(),
    body("status").isString().optional(),
    body("betreuer").isString(),
    body("gebiet").isString(),
    async (req, res, next) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        const themaResource = matchedData(req) as ThemaResource;
        try {
            const gebiet = await getGebiet(req.body.gebiet)
            if (gebiet.public || req.profId === gebiet.verwalter) {
                const createdThemaResource = await createThema(themaResource);
                res.status(201).send(createdThemaResource);
            }
            else res.status(403).send("thema kann nur vom Verwalter angelegt werden wenn das Gebiet nicht public ist")

        } catch (err) {
            if (err instanceof Error && err.message.toString() === `Gebiet with that ID probably doesnt exist`) {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "gebiet", value: req.params!.gebiet,
                })
                res.status(404).send({ errors: errors });
            }
            if (err instanceof Error &&
                err.message.toString() === "Das Gebiet ist geschlossen, neue Themen können nicht hinzugefügt werden.") {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "gebiet", value: req.params!.gebiet,
                })
                res.status(400).send({ errors: errors });
            }
            if (err instanceof Error && err.message.toString() === "Betreuer must be a valid ID") {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "betreuer", value: req.params!.betreuer,
                })
                res.status(400).send({ errors: errors });
            }
            else next(err);
        }
    });

themaRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("titel").isString().isLength({ min: 1, max: 100 }),
    body("beschreibung").isString().isLength({ min: 1, max: 1000 }),
    body("abschluss").isString(),
    body("status").isString(),
    async (req, res, next) => {
        if (req.params?.id === "alle") {
            return res.sendStatus(404);
        }
        const errors = validationResult(req).array();
        if (req.params?.id !== req.body.id) {
            errors.push(
                {
                    type: "field", location: "params", msg: "IDs do not match",
                    path: "id", value: req.params!.id,
                },
                {
                    type: "field", location: "body", msg: "IDs do not match",
                    path: "id", value: req.body.id
                }
            );
        }
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        const themaResource = matchedData(req) as ThemaResource;
        try {
            const thema = await getThema(req.params.id)
            const gebiet = await getGebiet(thema.gebiet)
            if (req.profId === thema.betreuer || req.profId === gebiet.verwalter) {
                const updatedThemaResource = await updateThema(themaResource)
                res.send(updatedThemaResource);
            }
            else res.status(403).send("thema kann nur vom Verwalter oder Betreuer des Themas verändert werden")

        } catch (err) {
            if (err instanceof Error && err.message.toString() === `Thema with that ID probably doesnt exist`) {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "id", value: req.params!.gebiet,
                })
                res.status(404).send({ errors: errors });
            }
            else next(err);
        }
    });

themaRouter.delete("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        if (req.params?.id === "alle") {
            return res.sendStatus(404);
        }
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        try {
            const thema = await getThema(req.params.id)
            const gebiet = await getGebiet(thema.gebiet)
            if (req.profId === thema.betreuer || req.profId === gebiet.verwalter) {
                const themaID = req.params!.id;
                await deleteThema(themaID);
            }
            else res.status(403).send("thema kann nur vom Verwalter oder Betreuer des Themas gelöscht werden")

            res.sendStatus(204)
        } catch (err) {
            if (err instanceof Error && err.message.toString() === `Thema with that ID probably doesnt exist`) {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(404).send({ errors: errors });
            }
            else next(err); // vermutlich nicht gefunden, in nächsten Aufgabenblättern genauer behandeln
        }
    })
