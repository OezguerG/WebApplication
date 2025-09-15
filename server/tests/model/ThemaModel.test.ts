import { HydratedDocument, Types } from "mongoose";
import { IThema, Thema } from "../../src/model/ThemaModel";
import { Gebiet, IGebiet } from "../../src/model/GebietModel";
import { IProf, Prof } from "../../src/model/ProfModel";

let profCreated: HydratedDocument<IProf>;
let gebietCreated: HydratedDocument<IGebiet>;

beforeEach(async () => {
    profCreated = await Prof.create({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
})

beforeEach(async () => {
    gebietCreated = await Gebiet.create({
        name: "Math",
        verwalter: profCreated._id
    });
})

test("Create Thema and retrieve attributes and also test ID use", async ()=> {
    const themaCreated = new Thema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        gebiet: gebietCreated._id,
        betreuer: profCreated._id
    });
    await themaCreated.save();
    
    const themaFound: HydratedDocument<IThema>[] =
    await Thema.find({ gebiet: gebietCreated._id, betreuer: profCreated._id }).exec();
    
    expect(themaFound.length).toBe(1);
    expect(themaFound[0].titel).toBe("Vektoren");
    expect(themaFound[0].beschreibung).toBe("Vektoren sind...");
    expect(themaFound[0].abschluss).toBe("any");
    expect(themaFound[0].status).toBe("offen");
    expect(themaFound[0].updatedAt).toBeTruthy();
    expect(themaFound[0].toJSON()).toEqual(themaCreated.toJSON()); 
})

test("Create Thema and retrieve abschluss with different entry of Thema and status", async ()=> {
    const themaCreated = new Thema({
        titel: "Vektoren", 
        beschreibung: "Vektoren sind...",
        abschluss: 'raw',
        gebiet: gebietCreated._id,
        betreuer: profCreated._id
    });
    await expect(themaCreated.save()).rejects.toThrow();

    const themaCreated2 = new Thema({
        titel: "Vektoren", 
        beschreibung: "Vektoren sind...",
        status: 'raw',
        gebiet: gebietCreated._id,
        betreuer: profCreated._id
    });
    await expect(themaCreated.save()).rejects.toThrow();
})

test("Create Thema and test pre save hooks", async ()=> {
    const gebietIdInvalid = new Thema({
        titel: "Vektoren", 
        beschreibung: "Vektoren sind...",
        gebiet: new Types.ObjectId(),
        betreuer: profCreated._id
    });
    await expect(gebietIdInvalid.save()).rejects.toThrow("Gebiet must be a valid ID");

    const profIdInvalid = new Thema({
        titel: "Vektoren", 
        beschreibung: "Vektoren sind...",
        gebiet: gebietCreated._id,
        betreuer: new Types.ObjectId()
    });
    await expect(profIdInvalid.save()).rejects.toThrow("Betreuer must be a valid ID");
})