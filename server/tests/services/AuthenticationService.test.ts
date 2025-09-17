import { HydratedDocument, Types } from "mongoose";
import { IProf, Prof } from "../../src/model/ProfModel";
import { login } from "../../src/services/AuthenticationService";


test("Negative test", async() => {

    const logged = await login("www", "JozeM123")
    expect(logged).toEqual({success: false})
});

test("testing log in", async() => {
    const prof = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123"
    });
    await prof.save();


    const logged = await login(prof.campusID.toString(), "JozeM123")
    expect(logged).toEqual({ success: true, id: prof._id.toString(), role: "u"})
});

test("testing log in with prof as admin", async() => {
    const prof = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123",
        admin: true
    });
    await prof.save();


    const logged = await login(prof.campusID.toString(), "JozeM123")
    expect(logged).toEqual({success: true, id: prof._id.toString(), role: "a"})
});

test("testing log fails", async() => {
    const prof = new Prof({
        name: "Joze Mendez",
        campusID: new Types.ObjectId(),
        password: "JozeM123",
        admin: true
    });
    await prof.save();

    const prof2 = new Prof({
        name: "Daniel Peters",
        campusID: new Types.ObjectId(),
        password: "DanielP123",
        admin: true
    });
    await prof2.save();

    //password false
    const logged = await login(prof2.campusID.toString(), "JozeM123");
    expect(logged).toEqual({ success: false })
    //id false
    const logged2 = await login(new Types.ObjectId().toString(), "JozeM123");
    expect(logged2).toEqual({ success: false })

    const logged3 = await login("123", "JozeM123");
    expect(logged3).toEqual({ success: false })
});