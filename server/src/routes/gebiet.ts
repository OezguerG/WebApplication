import express from "express";
import { GebietResource } from "../Resources";
import { createGebiet, deleteGebiet, getAlleGebiete, getGebiet, updateGebiet } from "../services/GebietService";
import { getAlleThemen } from "../services/ThemaService";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";

export const gebietRouter = express.Router();

gebietRouter.get("/alle",
    optionalAuthentication,
    async (req, res) => {
        const gebiete = await getAlleGebiete(req.profId);
        const gebieteFilter = []
        for (const gebiet of gebiete) {
            if (gebiet.public || gebiet.verwalter === req.profId) {
                gebieteFilter.push(gebiet)
            }
        }
        res.send(gebieteFilter); // default status 200
    });


gebietRouter.post("/",
    requiresAuthentication,
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("beschreibung").isString().optional().isLength({ min: 1, max: 1000 }),
    body("public").isBoolean().optional(),
    body("closed").isBoolean().optional(),
    body("verwalter").isString(),
    async (req, res, next) => {

        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        const gebietResource = matchedData(req) as GebietResource;
        try {
            const createdGebietResource = await createGebiet(gebietResource);
            if (req.profId !== req.body.verwalter) {
                res.status(403).send("gebiet kann nur vom Verwalter selbst angelegt werden")
            }
            res.status(201).send(createdGebietResource);
        } catch (err) {
            if (err instanceof Error && err.message.toString() === "Verwalter must be a valid Prof ID") {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "verwalter", value: req.body!.verwalter,
                })
                res.status(400).send({ errors: errors });
            }
            next(err);
        }
    });

gebietRouter.get("/:id",
    optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        try {
            const gebiet = await getGebiet(req.params!.id);
            if (gebiet.public || gebiet.verwalter === req.profId) res.send(gebiet); // Default Status 200
            else res.status(403).send("the gebiet is not public it has to be the verwalter sending the request")

        } catch (err) {
            if (err instanceof Error && err.message.toString() === "Gebiet with that ID probably doesnt exist") {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(404).send({ errors: errors });
            }
            
            else next(err);
        }
    });

gebietRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("id").isMongoId(),
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("beschreibung").isString().optional(),
    body("public").isBoolean().optional(),
    body("closed").isBoolean().optional(),
    body("verwalter").isString(),
    async (req, res, next) => {
        //possibly wrong
        if (req.params?.id === "alle") {
            return res.sendStatus(404);
        }
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
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
        const gebietResource = matchedData(req) as GebietResource;
        try {
            const gebiet = await getGebiet(req.params!.id);
            if (req.profId !== gebiet.verwalter) {
                res.status(403).send("gebiet kann nur vom Verwalter selbst angelegt werden")
            }
            const updatedGebietResource = await updateGebiet(gebietResource)
            res.send(updatedGebietResource);
        } catch (err) {
            if (err instanceof Error && err.message.toString() === "Gebiet with that ID probably doesnt exist") {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(404).send({ errors: errors });
            }
            if (err instanceof Error && err.message.toString() === "Verwalter must be a valid Prof ID") {
                errors.push({
                    type: "field", location: "body", msg: err.message.toString(),
                    path: "verwalter", value: req.body!.verwalter,
                })
                res.status(400).send({ errors: errors });
            }
            else next(err);
        }
    });

gebietRouter.delete("/:id",
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
            const gebiet = await getGebiet(req.params!.id);
            if (req.profId !== gebiet.verwalter) {
                res.status(403).send("gebiet kann nur vom Verwalter selbst gelöscht werden")
            }

            const gebietID = req.params!.id;
            await deleteGebiet(gebietID);
            res.sendStatus(204)
        } catch (err) {
            if (err instanceof Error && err.message.toString() === "Cannot delete Gebiet with open Themen.") {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(500).send({ errors: errors });
            }
            if (err instanceof Error && err.message.toString() === "Gebiet with that ID probably doesnt exist") {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(404).send({ errors: errors });
            }
            else next(err); // vermutlich nicht gefunden, in nächsten Aufgabenblättern genauer behandeln
        }
    })


gebietRouter.get("/:id/themen",
    optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }
        try {
            const gebiet = await getGebiet(req.params!.id);
            const themen2 = await getAlleThemen(req.params!.id);
            if (gebiet.public || req.profId === gebiet.verwalter) {
                const themen = await getAlleThemen(req.params!.id);
                res.send(themen);
            } else if (themen2.some(thema => thema.betreuer === req.profId)) {
                const filteredThemen = themen2.filter(thema => thema.betreuer === req.profId);
                res.send(filteredThemen);
            }
            res.status(403).send("themen können nur vom Verwalter oder betreuer " + 
            "des Gebiets selbst angefragt werden wenn diese nicht öffentlich sind")
        } catch (err) {
            if (err instanceof Error && err.message.toString() === "Gebiet with that ID probably doesnt exist") {
                errors.push({
                    type: "field", location: "params", msg: err.message.toString(),
                    path: "id", value: req.params!.id,
                })
                res.status(404).send({ errors: errors });
            }
            else next(err); // vermutlich nicht gefunden, in nächsten Aufgabenblättern genauer behandeln

        }

    })

