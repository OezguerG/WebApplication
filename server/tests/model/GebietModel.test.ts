import { HydratedDocument, Types } from "mongoose";
import { IGebiet, Gebiet } from "../../src/model/GebietModel";
import { IProf, Prof } from "../../src/model/ProfModel";
import { IThema, Thema } from "../../src/model/ThemaModel";

let profCreated: HydratedDocument<IProf>;

let themaCreated: HydratedDocument<IThema>;

beforeEach(async () => {
    profCreated = await Prof.create({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
})

test("Create Gebiet and retrieve attributes", async ()=> {
    const gebietCreated = new Gebiet({
        name: "Math",
        verwalter: profCreated._id
    });
    await gebietCreated.save();
    
    const gebietFound: HydratedDocument<IGebiet>[] =
    await Gebiet.find({ verwalter: profCreated._id }).exec();
    
    expect(gebietFound.length).toBe(1);
    expect(gebietFound[0].beschreibung).toBe(undefined);
    expect(gebietFound[0].public).toBe(false);
    expect(gebietFound[0].closed).toBe(false);
    expect(gebietFound[0].createdAt).toBeTruthy();
    expect(gebietFound[0].toJSON()).toEqual(gebietCreated.toJSON());    
})

test("Fail to create Gebiet with verwalter as random ID", async () => {

    const gebietCreated = new Gebiet({
        name: "Math",
        verwalter: new Types.ObjectId(),
    });

    await expect(Gebiet.create(gebietCreated)).rejects.toThrow("Verwalter must be a valid Prof ID");
});