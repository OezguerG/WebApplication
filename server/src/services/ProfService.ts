import { ProfResource } from "../Resources";
import { Types } from "mongoose";
import { Prof } from "../model/ProfModel";
import { Gebiet } from "../model/GebietModel";
import { deleteGebiet } from "./GebietService";

/**
 * Erzeugt einen Prof. Das Passwort darf nicht zurückgegeben werden.
 */
export async function createProf(profResource: ProfResource): Promise<ProfResource> {
    if(!profResource.password){
        throw new Error("Prof password is missing, cannot create");
    }
    const profCreated = await Prof.create({
        _id: new Types.ObjectId(),
        name: profResource.name,
        titel: profResource.titel,
        campusID: profResource.campusID.toString(),
        admin: profResource.admin!,
        password: profResource.password
    })
    const savedProf = await profCreated.save();

    return {
        id: savedProf._id.toString(),
        name: savedProf.name,
        titel: savedProf.titel,
        campusID: savedProf.campusID.toString(),
        admin: savedProf.admin!
    };
}

/**
 * Updated einen Prof. Beim Update wird der Prof über die id identifiziert.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function updateProf(profResource: ProfResource): Promise<ProfResource> {
    if (!profResource.id) {
        throw new Error("Prof id missing, cannot update");
    }
    const prof = await Prof.findById(profResource.id).exec();
    if (!prof) {
        throw new Error(`No prof with id ${profResource.id} found, cannot update`);
    }
    prof.name = profResource.name;
    if (profResource.titel) prof.titel = profResource.titel;
    prof.campusID = profResource.campusID;
    if (profResource.admin !== undefined) prof.admin = profResource.admin;
    if (profResource.password) prof.password = profResource.password;

    const savedProf = await prof.save();
    return {
        id: savedProf.id,
        name: savedProf.name,
        titel: savedProf.titel,
        campusID: savedProf.campusID.toString(),
        admin: savedProf.admin!,
    };
}

/**
 * Beim Löschen wird der Prof über die ID identifiziert.
 * Falls Prof nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Prof gelöscht wird, müssen auch alle zugehörigen Gebiete und Themen gelöscht werden.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function deleteProf(id: string): Promise<void> {
    if (!id) {
        throw new Error("No id given, cannot delete prof.");
    }
    const profId = new Types.ObjectId(id);
    const res = await Prof.deleteOne({ _id: profId }).exec();
    if (res.deletedCount !== 1) {
        throw new Error(`No prof with id ${id} deleted, probably id not valid`);
    }
    const gebiete = await Gebiet.find({ verwalter: profId }).exec();
    for (const gebiet of gebiete) {
        try {
            await deleteGebiet(gebiet.id);
        } catch (err) {
            // we ignore that here
        }
    }
}

/**
 * Gibt alle Profs zurück, Passwörter werden nicht zurückgegeben.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function getAlleProfs(): Promise<ProfResource[]> {
    const arrProfs = await Prof.find({}).exec();
    const arrProfRes = arrProfs.map((prof) => ({
        id: prof.id,
        name: prof.name,
        titel: prof.titel,
        campusID: prof.campusID.toString(),
        admin: prof.admin!,
    }));
    return arrProfRes;
}

export async function getProf(id: string): Promise<ProfResource[]> {
    const prodId = new Types.ObjectId(id);
    const prof = await Prof.find({ _id: prodId }).exec();
    if (!prof) {
            throw new Error("Prof with that ID probably doesnt exist");
    }
    return prof;
}

