import { HydratedDocument, Types } from "mongoose";
import { IProf, Prof } from "../../src/model/ProfModel";
import { ThemaResource } from "../../src/Resources";
import { IThema, Thema } from "../../src/model/ThemaModel";
import { Gebiet, IGebiet } from "../../src/model/GebietModel";
import { createThema, deleteThema, getAlleThemen, getThema, updateThema } from "../../src/services/ThemaService";

let prof: HydratedDocument<IProf>;
let prof2: HydratedDocument<IProf>;
let gebiet: HydratedDocument<IGebiet>;
let gebiet2: HydratedDocument<IGebiet>;
let themaRes: ThemaResource;
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
    gebiet = await Gebiet.create({
        name: "Math",
        public: true,
        verwalter: prof._id.toString()
    });
})

beforeEach(async () => {
    gebiet2 = await Gebiet.create({
        name: "Math",
        public: true,
        closed: true,
        verwalter: prof._id.toString()
    });
})

beforeEach(async () => {
    themaRes = await createThema({
        id: new Types.ObjectId().toString(),
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "offen",
        gebiet: gebiet._id!.toString(),
        betreuer: prof._id!.toString()
    });
})

test("testing createThema resource and getAlleThema", async() => {
    const invalidGebietId = new Types.ObjectId().toString();
    await expect(createThema({
        id: new Types.ObjectId().toString(),
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "offen",
        gebiet: invalidGebietId,
        betreuer: prof._id!.toString()
    })).rejects.toThrow("Gebiet mit der ID " + invalidGebietId + " wurde nicht gefunden.");

    await expect(createThema({
        id: new Types.ObjectId().toString(),
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "offen",
        gebiet: gebiet2._id!.toString(),
        betreuer: prof._id!.toString()
    })).rejects.toThrow("Das Gebiet ist geschlossen, neue Themen können nicht hinzugefügt werden.");
    
    const getThema = await getAlleThemen(themaRes.gebiet);
    expect(getThema[0]).toStrictEqual(themaRes);
    expect(getThema[0].betreuerName).toBe(prof.name);

    const randomId = new Types.ObjectId().toString();
    await expect(getAlleThemen(randomId)).rejects.toThrow("Gebiet mit der ID " + randomId + " wurde nicht gefunden.");
});
 
test("testing updateThema", async() => {
    await updateThema({
        id: themaRes.id,
        titel: "Diagramme",
        beschreibung: "Diagramme sind...",
        abschluss: "any",
        status: "offen",
        gebiet: gebiet._id.toString(),
        betreuer: prof2._id.toString()
    });
    const themaFound: HydratedDocument<IThema>[] =
    await Thema.find({ _id: themaRes.id }).exec();
    expect(themaFound[0].titel).toBe("Diagramme");
    expect(themaFound[0].beschreibung).toBe("Diagramme sind...");
    expect(themaFound[0].status).toBe("offen");
    expect(themaFound[0].gebiet).toEqual(gebiet._id);
    expect(themaFound[0].betreuer).toEqual(prof._id);
    const missingIdUpdate: ThemaResource = {
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        gebiet: gebiet._id.toString(),
        betreuer: prof._id.toString()
    };
    await expect(updateThema(missingIdUpdate)).rejects.
    toThrow("Thema id missing, cannot update");

    const nonExistentIdUpdate: ThemaResource = {
        id: new Types.ObjectId().toString(),
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        gebiet: gebiet._id.toString(),
        betreuer: prof._id.toString()
    };
    await expect(updateThema(nonExistentIdUpdate)).rejects.
    toThrow("No thema with id");
});

test("testing getThema", async() => { 
    const invalidId = new Types.ObjectId().toString();
    await expect(getThema(invalidId)).rejects.
    toThrow("Thema with that ID probably doesnt exist")
    
    const thema = await getThema(themaRes.id!);
    expect(thema.titel).toBe("Vektoren");
    expect(thema.beschreibung).toBe("Vektoren sind...");
    expect(thema.status).toBe("offen");
    expect(thema.gebiet).toEqual(gebiet._id.toString());
    expect(thema.betreuer).toEqual(prof._id.toString());
});

test("testing deleteThema", async() => { 
    await expect(deleteThema("")).rejects.
    toThrow("No id given, cannot delete Thema.");

    const invalidId = new Types.ObjectId().toString();
    await expect(deleteThema(invalidId)).rejects.
    toThrow("No thema with id " + invalidId + " deleted, probably id not valid")

    const themaExists = await Thema.exists({ _id: themaRes.id });
    expect(themaExists).toBeTruthy();
    
    await deleteThema(themaRes.id!);

    const themaAfterDelete = await Gebiet.findById(themaRes.id).exec();
    expect(themaAfterDelete).toBeNull;
});