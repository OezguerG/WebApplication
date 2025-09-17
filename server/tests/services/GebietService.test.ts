import { HydratedDocument, Types } from "mongoose";
import { IProf, Prof } from "../../src/model/ProfModel";
import { GebietResource } from "../../src/Resources";
import { createGebiet, deleteGebiet, getAlleGebiete, getGebiet, updateGebiet } from "../../src/services/GebietService";
import { Gebiet, IGebiet } from "../../src/model/GebietModel";
import { IThema, Thema } from "../../src/model/ThemaModel";

let prof: HydratedDocument<IProf>;
let gebietRes: GebietResource;
let prof2: HydratedDocument<IProf>;
let gebietRes2: GebietResource;
let thema: HydratedDocument<IThema>;
let thema2: HydratedDocument<IThema>;

beforeEach(async () => {
    prof = await Prof.create({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
})

beforeEach(async () => {
    prof2 = await Prof.create({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
})

beforeEach(async () => {
    gebietRes = await createGebiet({
        id: new Types.ObjectId().toString(),
        name: "Math",
        public: true,
        verwalter: prof._id.toString()
    });
})

beforeEach(async () => {
    gebietRes2 = await createGebiet({
        id: new Types.ObjectId().toString(),
        name: "Math",
        public: true,
        verwalter: prof2._id.toString()
    });
})

beforeEach(async () => {
    thema = await Thema.create({
        id: new Types.ObjectId().toString(),
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "offen",
        gebiet: gebietRes.id!.toString(),
        betreuer: prof._id.toString()
    });
})


beforeEach(async () => {
    thema2 = await Thema.create({
        id: new Types.ObjectId().toString(),
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietRes2.id!.toString(),
        betreuer: prof2._id.toString()
    });
})


test("testing createGebiet resource and getAlleGebiet", async() => {
    const getGebiete = await getAlleGebiete(gebietRes.verwalter);
    expect(getGebiete[0].name).toBe("Math");
    expect(getGebiete[0].public).toBe(true);
    expect(getGebiete[0].anzahlThemen).toBe(1);
    expect(getGebiete[0].verwalterName).toBe(prof.name);
    expect(getGebiete[0].verwalter.toString()).toEqual(gebietRes.verwalter);
    
    expect(getGebiete[1].name).toBe("Math");
    expect(getGebiete[1].public).toBe(true);
    expect(getGebiete[1].anzahlThemen).toBe(1);
    expect(getGebiete[1].verwalter.toString()).toEqual(gebietRes2.verwalter);
    expect(getGebiete[1].verwalterName).toBe(prof2.name);
});

test("testing getGebiet", async() => {

    const invalidId = new Types.ObjectId().toString();
    await expect(getGebiet(invalidId)).rejects.
    toThrow("Gebiet with that ID probably doesnt exist")
    
    const gebiet = await getGebiet(gebietRes.id!);
    expect(gebiet.name).toBe("Math");
    expect(gebiet.public).toBe(true);
    expect(gebiet.anzahlThemen).toBe(1);
    expect(gebiet.verwalter.toString()).toEqual(gebietRes.verwalter);
});



test("testing updateGebiet", async() => {
    await updateGebiet({
        id: gebietRes.id!.toString(),
        name: "Physiks",
        public: true,
        closed: true,
        verwalter: prof._id.toString()
    });
    const gebietFound: HydratedDocument<IGebiet>[] =
    await Gebiet.find({ _id: gebietRes.id }).exec();
    expect(gebietFound[0].name).toBe("Physiks");
    expect(gebietFound[0].public).toBe(true);
    expect(gebietFound[0].closed).toBe(true);
    expect(gebietFound[0].verwalter.toString()).toEqual(gebietRes.verwalter);
    
    const missingIdUpdate: GebietResource = {
        name: "Physiks",
        public: true,
        verwalter: prof._id.toString()
    };
    await expect(updateGebiet(missingIdUpdate)).rejects.
    toThrow("Gebiet id missing, cannot update");

    const nonExistentIdUpdate: GebietResource = {
        id: new Types.ObjectId().toString(),
        name: "Physiks",
        public: true,
        verwalter: prof._id.toString()
    };
    await expect(updateGebiet(nonExistentIdUpdate)).rejects.
    toThrow("No gebiet with id");
});
 
test("testing deleteGebiet", async() => {
    await expect(deleteGebiet("")).rejects.
    toThrow("No id given, cannot delete Gebiet.");
    
    await expect(deleteGebiet(gebietRes.id!)).rejects.toThrow("Cannot delete Gebiet with open Themen");
    
    const invalidId = new Types.ObjectId().toString()
    await expect(deleteGebiet(invalidId)).rejects.
    toThrow("No gebiet with id " + invalidId + " deleted, probably id not valid");

    const gebietExists = await Gebiet.exists({ _id: gebietRes2.id });
    expect(gebietExists).toBeTruthy();

    const themaExists = await Thema.exists({ gebiet: gebietRes2.id });
    expect(themaExists).toBeTruthy();
    
    await deleteGebiet(gebietRes2.id!)

    const gebietAfterDelete = await Gebiet.findById(gebietRes2.id).exec();
    expect(gebietAfterDelete).toBeNull;
    
    const themaAfterDelete = await Thema.findById(gebietRes2.id).exec();
    expect(themaAfterDelete).toBeNull; 
});


