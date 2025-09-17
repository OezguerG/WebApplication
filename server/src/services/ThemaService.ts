import { HydratedDocument, Types } from "mongoose";
import { ThemaResource } from "../Resources";
import { Thema } from "../model/ThemaModel";
import { Gebiet } from "../model/GebietModel";
import { dateToString } from "./ServiceHelper";
import { IProf, Prof } from "../model/ProfModel";
import { updateGebiet } from "./GebietService";

/**
 * Gibt alle Themen in einem Gebiet zurück.
 * Wenn das Gebiet nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleThemen(gebietId: string): Promise<ThemaResource[]> {
        const gebietExists = await Gebiet.exists({ _id: gebietId });
        if (!gebietExists) {
                throw new Error(`Gebiet mit der ID ${gebietId} wurde nicht gefunden.`);
        }
        const arrThemen = await Thema.find({ gebiet: gebietId }).exec();

        const arrThemaRes = await Promise.all(arrThemen.map(async (thema) => {

                const prof = await Prof.findById(thema.betreuer);
                const betreuerName = prof!.name;
                return {
                        id: thema.id,
                        titel: thema.titel,
                        beschreibung: thema.beschreibung,
                        abschluss: thema.abschluss!,
                        status: thema.status!,
                        gebiet: thema.gebiet.toString(),
                        betreuer: thema.betreuer._id.toString(),
                        betreuerName: betreuerName,
                        updatedAt: dateToString(thema.updatedAt!)
                }

        }));
        return arrThemaRes;
}

/**
 * Liefert die ThemaResource mit angegebener ID.
 * Falls kein Thema gefunden wurde, wird ein Fehler geworfen.
 */
export async function getThema(id: string): Promise<ThemaResource> {
        const thema = await Thema.findById(id).exec();
        if (!thema) {
                throw new Error("Thema with that ID probably doesnt exist");
        }
        const prof = await Prof.findById(thema.betreuer);
        const betreuerName = prof!.name;
        return {
                id: thema.id,
                titel: thema.titel,
                beschreibung: thema.beschreibung,
                abschluss: thema.abschluss!,
                status: thema.status!,
                gebiet: thema.gebiet.toString(),
                betreuer: thema.betreuer.toString(),
                betreuerName: betreuerName,
                updatedAt: dateToString(thema.updatedAt!)
        }
}

/**
 * Erzeugt ein Thema.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (closed) ist, wird ein Fehler wird geworfen.
 */
export async function createThema(themaResource: ThemaResource): Promise<ThemaResource> {
        const gebiet = await Gebiet.findById(themaResource.gebiet).exec();

        if (!gebiet) {
                throw new Error(`Gebiet mit der ID ${themaResource.gebiet} wurde nicht gefunden.`);
        }

        if (gebiet.closed) {
                throw new Error("Das Gebiet ist geschlossen, neue Themen können nicht hinzugefügt werden.");
        }


        await updateGebiet({
                id: gebiet._id.toString(),
                name: gebiet.name,
                public: gebiet.public,
                verwalter: gebiet.verwalter._id.toString()
        });

        const themaCreated = await Thema.create({
                _id: new Types.ObjectId(),
                titel: themaResource.titel,
                beschreibung: themaResource.beschreibung,
                abschluss: themaResource.abschluss!,
                status: themaResource.status!,
                gebiet: themaResource.gebiet,
                betreuer: themaResource.betreuer,
                updatedAt: themaResource.updatedAt!
        })
        const savedThema = await themaCreated.save();

        const prof = await Prof.findById(savedThema.betreuer);
        const betreuerName = prof!.name;

        return {
                id: savedThema._id.toString(),
                titel: savedThema.titel,
                beschreibung: savedThema.beschreibung,
                abschluss: savedThema.abschluss!,
                status: savedThema.status!,
                gebiet: savedThema.gebiet.toString(),
                betreuer: savedThema.betreuer.toString(),
                betreuerName: betreuerName,
                updatedAt: dateToString(themaCreated.updatedAt!)
        };
}

/**
 * Updated ein Thema. Es können nur Titel, Beschreibung, Abschluss und Status geändert werden.
 * Aktuell können Themen nicht von einem Gebiet in ein anderes verschoben werden.
 * Auch kann der Betreuer nicht geändert werden.
 * Falls das Gebiet oder Betreuer geändert wurde, wird dies ignoriert.
 */
export async function updateThema(themaResource: ThemaResource): Promise<ThemaResource> {
        if (!themaResource.id) {
                throw new Error("Thema id missing, cannot update");
        }
        const thema = await Thema.findById(themaResource.id).exec();
        if (!thema) {
                throw new Error(`No thema with id ${themaResource.id} found, cannot update`);
        }
        thema.titel = themaResource.titel;
        thema.beschreibung = themaResource.beschreibung;
        if (themaResource.abschluss !== undefined) thema.abschluss = themaResource.abschluss;
        if (themaResource.status !== undefined) thema.status = themaResource.status;
        const savedThema = await thema.save();

        const prof = await Prof.findById(savedThema.betreuer);
        const betreuerName = prof!.name;

        return {
                id: savedThema.id,
                titel: savedThema.titel,
                beschreibung: savedThema.beschreibung,
                abschluss: savedThema.abschluss,
                status: savedThema.status,
                gebiet: savedThema.gebiet.toString(),
                betreuer: savedThema.betreuer.toString(),
                betreuerName: betreuerName,
                updatedAt: dateToString(savedThema.updatedAt!)
        };
}

/**
 * Beim Löschen wird das Thema über die ID identifiziert.
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteThema(id: string): Promise<void> {
        if (!id) {
                throw new Error("No id given, cannot delete Thema.");
        }
        const themaId = new Types.ObjectId(id);
        const res = await Thema.deleteOne({ _id: themaId }).exec();

        if (res.deletedCount !== 1) {
                throw new Error(`No thema with id ${id} deleted, probably id not valid`);
        }
}
