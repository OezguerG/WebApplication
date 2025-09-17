import { HydratedDocument, Types } from "mongoose";
import { IProf, Prof, IProfMethods } from "../../src/model/ProfModel";
import bcrypt from "bcryptjs";

test("Create Prof and retrieve password of Prof", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await profCreated.save();

    const profFound: HydratedDocument<IProf>[] =
    await Prof.find({ campusID: profCreated.campusID }).exec();

    const hashed = await bcrypt.compare("JozeM123", profFound[0].password)
    expect(hashed).toBe(true);

    expect(profFound[0].toJSON()).toEqual(profCreated.toJSON());    
})

test("Create Prof and compare old hascode to new hashcode", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await profCreated.save();
    const hashPasswordOld = await bcrypt.compare("JozeM123", profCreated.password);
    
    profCreated.password = "newPassword";
    await profCreated.save();
    
    const hashPasswordNew = await bcrypt.compare("JozeM123", profCreated.password);
    expect(hashPasswordNew).toBe(false);
})

test("Create Prof and look if old hashcode is not modified after update of other property", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await profCreated.save();
    const hashPasswordOld = await bcrypt.compare("JozeM123", profCreated.password);
    expect(hashPasswordOld).toBe(true);

    profCreated.name = "Joze M";
    await profCreated.save();
    
    const hashPasswordNew = await bcrypt.compare("JozeM123", profCreated.password);
    expect(hashPasswordNew).toBe(true);
})

test("Create Prof and look if updateOne is working after update of password", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await profCreated.save();
    const hashPasswordOld = await bcrypt.compare("JozeM123", profCreated.password);
    
    await Prof.updateOne({_id: profCreated._id}, { password: "Joze1234"});
    const updatedProf = await Prof.findById(profCreated._id);
    
    if(updatedProf){
        const hashPasswordNew = await bcrypt.compare("Joze1234", updatedProf.password);
        expect(hashPasswordNew).toBe(true);
    } else {
        expect(hashPasswordOld).toBeNull();
    }
})

test("Create Prof and look if new method isCorrectPassword is working if hashed", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    })
    await profCreated.save();

    const hashPassword = await profCreated.isCorrectPassword("JozeM123");
    
    expect(hashPassword).toBe(true);
})

test("Create Prof and look if new method isCorrectPassword is working if hashed password is wrong", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    })
    await profCreated.save();

    const hashPassword = await profCreated.isCorrectPassword("JozeM124");
    
    expect(hashPassword).toBe(false);
})

test("Create Prof and look if new method isCorrectPassword is working if not hashed", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    })
    await expect(profCreated.isCorrectPassword("JozeM123")).rejects.toThrow("Password not hashed");
})


//tests after grading paper
test("isCorrectPassword liefert falsch, wenn falsches Passwort bei gespeichertem Prof eingegeben wurde", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    })
    await profCreated.save();
    const falsePassword = await profCreated.isCorrectPassword("JozeM1234");
    expect(falsePassword).toBe(false);
})

test("isCorrectPassword liefert falsch, wenn der Passworthash bei gespeichertem Prof eingegeben wurde", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    })
    await profCreated.save();
    const falsePassHashed = await bcrypt.hash("JozeM1234", 10)
    const falsePassword = await profCreated.isCorrectPassword(falsePassHashed);
    expect(falsePassword).toBe(false);
})

test("isCorrectPassword wirft Fehler, wenn Passwortänderung nicht gespeichert wurde", async ()=> {
    const profCreated = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    })
    await profCreated.save();


    profCreated.password = "JozeM1234";

    await expect(profCreated.isCorrectPassword("JozeM1234")).rejects.toThrow("Password not hashed");
})