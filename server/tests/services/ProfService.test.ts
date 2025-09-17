import { HydratedDocument, Types } from "mongoose";
import { IProf, Prof } from "../../src/model/ProfModel";
import { createProf, deleteProf, getAlleProfs, updateProf } from "../../src/services/ProfService";
import { ProfResource } from "../../src/Resources";
import bcrypt from "bcryptjs";
import { Gebiet, IGebiet } from "../../src/model/GebietModel";

let profRes: ProfResource;
let gebiet: HydratedDocument<IGebiet>;

beforeEach(async () => {
    profRes = await createProf({
        id: new Types.ObjectId().toString(),
        name: "Joze Mendez",
        titel: "titel",
        campusID: new Types.ObjectId().toString(),
        admin: true,
        password: "JozeM123"
    });
})

beforeEach(async () => {
    gebiet = await Gebiet.create({
        name: "Math",
        public: true,
        verwalter: profRes.id!.toString()
    });
})

test("testing createProf resource and getAlleProfs", async() => {
    const getProfs = await getAlleProfs();
    expect(getProfs[0]).toStrictEqual(profRes);

    await expect(createProf({
        id: new Types.ObjectId().toString(),
        name: "Joze Mendez",
        titel: "titel",
        campusID: new Types.ObjectId().toString(),
        admin: true
    })).rejects.toThrow("Prof password is missing, cannot create");
});

test("testing updateProf", async() => {
    const profResUpdate = await updateProf({
        id: profRes.id,
        name: "Joze M",
        titel: "titel1",
        campusID: new Types.ObjectId().toString(),
        admin: true,
        password: "JozeM1234"
    });

    const profFound: HydratedDocument<IProf>[] =
    await Prof.find({ _id: profRes.id }).exec();
    expect(profFound[0].name).toBe("Joze M");
    expect(profFound[0].titel).toBe("titel1");
    expect(profFound[0].campusID.toString()).toEqual(profResUpdate.campusID);
    expect(profFound[0].admin).toBe(profResUpdate.admin);
    const hashed = await bcrypt.compare("JozeM1234", profFound[0].password)
    expect(hashed).toBe(true);

    const missingIdUpdate: ProfResource = {
        name: "No ID Prof",
        campusID: profRes.campusID.toString(),
        admin: profRes.admin!,
    };
    await expect(updateProf(missingIdUpdate)).rejects.
    toThrow("Prof id missing, cannot update");

    const nonExistentIdUpdate: ProfResource = {
        id: new Types.ObjectId().toString(),
        name: "Non-existent Prof",
        campusID: new Types.ObjectId().toString(),
        admin: false,
    };
    await expect(updateProf(nonExistentIdUpdate)).rejects.
    toThrow("No prof with id");
});

test("testing deleteProf", async() => {
    const invalidId = new Types.ObjectId().toString()
    await expect(deleteProf(invalidId)).rejects.
    toThrow("No prof with id " + invalidId + " deleted, probably id not valid");

    await expect(deleteProf("")).rejects.
    toThrow("No id given, cannot delete prof.");
    
    
    const foundProfBeforeDelete = await Prof.findById(profRes.id);
    expect(foundProfBeforeDelete).toBeDefined();

    const gebietProfBeforeDelete = await Gebiet.findById(profRes.id);
    expect(gebietProfBeforeDelete).toBeDefined();

    await deleteProf(profRes.id!);

    const foundProfAfterDelete = await Prof.findById(profRes.id);
    expect(foundProfAfterDelete).toBeNull();

    
    const gebietProfAfterDelete = await Gebiet.findById(profRes.id);
    expect(gebietProfAfterDelete).toBeNull();
});



