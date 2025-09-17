import { HydratedDocument, Types } from "mongoose";
import { IProf, Prof } from "../../src/model/ProfModel";
import bcrypt from "bcryptjs";


test("Create Prof and retrieve attributes", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await profCreated.save();
    
    const profFound: HydratedDocument<IProf>[] =
    await Prof.find({ campusID: profCreated.campusID }).exec();
    
    expect(profFound.length).toBe(1);
    expect(profFound[0].name).toBe("Joze Mendez");
    expect(profFound[0].titel).toBe(undefined);
    const hashed = await bcrypt.compare("JozeM123", profFound[0].password)
    expect(hashed).toBe(true);
    expect(profFound[0].admin).toBe(false);
    expect(profFound[0].toJSON()).toEqual(profCreated.toJSON());
})

test("Test unique requirement", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await profCreated.save();
    
    const Prof2Created = new Prof({
        name: "Andres Schiebler",
        campusID: profCreated.campusID,
        password: "AndreasS123"
    });
    await expect (Prof2Created.save()).rejects.toThrow();
        
})

test("Create Prof and retrieve password of Prof", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await profCreated.save();
    const hashPassword = await bcrypt.compare("JozeM123", profCreated.password);
    expect(hashPassword).toBe(true);
        
})

test("Create Prof with no password", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
    });
    await expect(profCreated.save()).rejects.toThrow();

})

