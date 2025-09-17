import express from "express";
import { ProfResource } from "../Resources";
import { createProf, deleteProf, getAlleProfs, updateProf } from "../services/ProfService";
import { param, body, validationResult, matchedData } from 'express-validator';
import { requiresAuthentication } from "./authentication";

export const profRouter = express.Router();


profRouter.get("/alle",
    requiresAuthentication,
    async (req, res) => {
        if (req.role !== "a") {
            return res.status(403).send({ error: "Access denied: Admins only" });
        }

        try {
            const profs = await getAlleProfs();
            res.status(200).send(profs);
        } catch (err) {
            res.status(500).send({ error: "An error occurred while fetching Profs" });
        }
    }
);

profRouter.post("/",
    requiresAuthentication,
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("titel").isString().isLength({ min: 1, max: 100 }).optional(),
    body("campusID").isString().isLength({ min: 1, max: 100 }),
    body("password").isString().isStrongPassword(),
    body("admin").isBoolean().optional(),
    async (req, res, next) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        const profResource = matchedData(req) as ProfResource;

        try {
            if (req.role === "a") {
                const createdProfResource = await createProf(profResource);
                res.status(201).send(createdProfResource);
            }
            else res.status(403).send("ein Prof dar nur von einem Administrator angelegt werden");
        } catch (err) {
            if (err instanceof Error && err.message.toString() === "CampusID must be unique") {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "campusID", value: req.params!.campusID,
                })
                res.status(400).send({ errors: errors });
            }
            else next(err);
        }
    });

profRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("campusID").isString().isLength({ min: 1, max: 100 }),
    body("password").isString().optional().isStrongPassword(),
    body("admin").isBoolean(),
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
        const profResource = matchedData(req) as ProfResource;

        try {
            if (req.role === "a") {
                const updatedProfResource = await updateProf(profResource)
                res.send(updatedProfResource);
            }
            else res.status(403).send("ein Prof darf nur von einem Administrator verändert werden");

        } catch (err) {
            if (err instanceof Error && err.message.toString() === `No prof with id ${profResource.id} found, cannot update`) {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                }, {
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "id", value: req.body!.id,
                }
                )
                res.status(404).send({ errors: errors });
            }
            if (err instanceof Error && err.message.toString() === "CampusID must be unique") {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "campusID", value: req.body!.campusID,
                })
                res.status(400).send({ errors: errors });
            }
            else next(err);
        }
    });

profRouter.delete("/:id",
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
            if (req.role === "a") {
                const profID = req.params!.id;
                if (req.profId === profID) {
                    res.status(403).send("ein Prof darf sich nicht selbst löschen");
                }
                await deleteProf(profID);
                res.sendStatus(204)
            }
            else res.status(403).send("ein Prof darf nur von einem Administrator gelöscht werden");
        } catch (err) {
            if (err instanceof Error && err.message.toString() === `No prof with id ${req.params!.id} deleted, probably id not valid`) {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(404).send({ errors: errors });
            }
            else next(err); // vermutlich nicht gefunden, in nächsten Aufgabenblättern genauer behandeln
        }
    })
