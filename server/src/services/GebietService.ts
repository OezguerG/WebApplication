import { HydratedDocument, Types } from "mongoose";
import { GebietResource } from "../Resources";
import { Gebiet } from "../model/GebietModel";
import { Thema } from "../model/ThemaModel";
import { deleteThema } from "./ThemaService";
import { dateToString } from "./ServiceHelper";
import { IProf, Prof } from "../model/ProfModel";

/**
 * Gibt alle Gebiete zurück, die für einen Prof sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Gebiete
 * - alle eigenen Gebiete, dies ist natürlich nur möglich, wenn die profId angegeben ist.
 */
export async function getAlleGebiete(profId?: string): Promise<GebietResource[]> {
      const filter: any = { $or: [{ public: true }] };
      if (profId) {
            filter.$or.push({ verwalter: profId });
      }

      const arrGebiet = await Gebiet.find(filter).exec();

      const arrGebietRes = await Promise.all(arrGebiet.map(async (gebiet) => {
            const anzahlThemen = await Thema.countDocuments({ gebiet: gebiet._id }).exec();
            const prof = await Prof.findById(gebiet.verwalter)
            const verwalterName = prof!.name;
            return {
                  id: gebiet.id,
                  name: gebiet.name,
                  beschreibung: gebiet.beschreibung,
                  public: gebiet.public!,
                  closed: gebiet.closed!,
                  verwalter: gebiet.verwalter.toString(),
                  verwalterName: verwalterName,
                  createdAt: dateToString(gebiet.createdAt!),
                  anzahlThemen: anzahlThemen
            };
      }));
      return arrGebietRes;
}

/**
 * Liefert das Gebiet mit angegebener ID.
 * Falls kein Gebiet gefunden wurde, wird ein Fehler geworfen.
 */
export async function getGebiet(id: string): Promise<GebietResource> {
      const gebiet = await Gebiet.findById(id).exec();
      if (!gebiet) {
            throw new Error("Gebiet with that ID probably doesnt exist");
      }
      const anzahlThemen = await Thema.countDocuments({ gebiet: gebiet._id }).exec();
      const prof = await Prof.findById(gebiet.verwalter)
      const verwalterName = prof!.name;

      return {
            id: gebiet.id,
            name: gebiet.name,
            beschreibung: gebiet.beschreibung,
            public: gebiet.public!,
            closed: gebiet.closed!,
            verwalter: gebiet.verwalter.toString(),
            verwalterName: verwalterName,
            createdAt: dateToString(gebiet.createdAt!),
            anzahlThemen: anzahlThemen
      }
}

/**
 * Erzeugt das Gebiet.
 */
export async function createGebiet(gebietResource: GebietResource): Promise<GebietResource> {
      const gebietCreated = await Gebiet.create({
            _id: new Types.ObjectId(),
            name: gebietResource.name,
            beschreibung: gebietResource.beschreibung,
            public: gebietResource.public!,
            closed: gebietResource.closed!,
            verwalter: gebietResource.verwalter.toString(),
            createdAt: gebietResource.createdAt,

      })
      
      const savedGebiet = await gebietCreated.save();
      const anzahlThemen = await Thema.countDocuments({ gebiet: savedGebiet._id }).exec();
      
      const prof = await Prof.findById(savedGebiet.verwalter)
      const verwalterName = prof!.name;
      return {
            id: savedGebiet._id.toString(),
            name: savedGebiet.name,
            beschreibung: savedGebiet.beschreibung,
            public: savedGebiet.public!,
            closed: savedGebiet.closed!,
            verwalter: savedGebiet.verwalter.toString(),
            verwalterName: verwalterName,
            createdAt: dateToString(savedGebiet.createdAt!),
            anzahlThemen: anzahlThemen
      };
}

/**
 * Ändert die Daten eines Gebiets.
 * Aktuell können nur folgende Daten geändert werden: name, public, closed.
 * Falls andere Daten geändert werden, wird dies ignoriert.
 */
export async function updateGebiet(gebietResource: GebietResource): Promise<GebietResource> {
      if (!gebietResource.id) {
            throw new Error("Gebiet id missing, cannot update");
      }
      const gebiet = await Gebiet.findById(gebietResource.id).exec();
      
      if (!gebiet) {
            throw new Error(`No gebiet with id ${gebietResource.id} found, cannot update`);
      }

      const exists = await Prof.exists({ _id : gebietResource.verwalter})
      if (gebietResource.verwalter && !exists) {

            throw new Error("Verwalter must be a valid Prof ID");
      }
      const anzahlThemen = await Thema.countDocuments({ gebiet: gebiet._id }).exec();

      gebiet.name = gebietResource.name;
      if(gebietResource.public !== undefined) gebiet.public = gebietResource.public;
      if(gebietResource.closed !== undefined) gebiet.closed = gebietResource.closed;

      const savedGebiet = await gebiet.save();

      const prof = await Prof.findById(savedGebiet.verwalter)
      const verwalterName = prof!.name;

      return {
            id: savedGebiet.id,
            name: savedGebiet.name,
            beschreibung: savedGebiet.beschreibung,
            public: savedGebiet.public!,
            closed: savedGebiet.closed!,
            verwalter: savedGebiet.verwalter.toString(),
            verwalterName: verwalterName,
            createdAt: dateToString(savedGebiet.createdAt!),
            anzahlThemen: anzahlThemen
      };
}

/**
 * Beim Löschen wird das Gebiet über die ID identifiziert.
 * Falls ein Gebiet nicht gefunden wurde, oder ein dazugehöriges Thema noch offen ist
 * (oder aus anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteGebiet(id: string): Promise<void> {
      if (!id) {
            throw new Error("No id given, cannot delete Gebiet.");
      }
      const gebietId = new Types.ObjectId(id);

      const offeneThemen = await Thema.find({ gebiet: gebietId, status: "offen" }).exec();
      if (offeneThemen.length > 0) {
            throw new Error("Cannot delete Gebiet with open Themen.");
      }

      const res = await Gebiet.deleteOne({ _id: gebietId }).exec();

      if (res.deletedCount !== 1) {
            throw new Error(`No gebiet with id ${id} deleted, probably id not valid`);
      }
      const themen = await Thema.find({ gebiet: gebietId }).exec();
      for (const thema of themen) {
            try {
                  await deleteThema(thema.id);
            } catch (err) {
                  //ignore here
            }
      }
}
