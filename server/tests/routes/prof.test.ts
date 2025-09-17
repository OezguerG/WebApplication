import { Types } from "mongoose";
import app from "../../src/app";
import { createProf, getAlleProfs } from "../../src/services/ProfService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";
import supertest from "supertest";

beforeEach(async () => {
    await createProf({ name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })
    await performAuthentication("admin", "xyzXYZ123!§xxx");
});

test("Create Profs, einfacher Positivtest", async () => {
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    const profRes2 = await createProf({
        name: "Mein Prof",
        campusID: "MP12",
        password: "abcABC123!§",
        admin: false
    });

    const profRes3 = await createProf({
        name: "Mein Prof",
        campusID: "MP123",
        password: "abcABC123!§",
        admin: false
    });
})
test("requiresAuthentication, einfacher Negativtest", async () => {
    const testee = supertest(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            campusID: "MP",
            password: "abcABC123!§",
            admin: false
        });
    expect(response.status).toBe(401);

})

test("Get Profs, einfacher Positivtest", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/prof/alle`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body[1].name).toBe("Mein Prof");
    expect(response.body[1].titel).toBe(undefined);
    expect(response.body[1].campusID).toBe("MP");
    expect(response.body[1].admin).toBe(false);
    expect(response.body[1].password).toBeUndefined();
    expect(response.body[1].id).toBeDefined();
    // Prüfe Datenbank
    const profs = await getAlleProfs();
    expect(profs
        .some(p => p.id === response.body[1].id)
    ).toBe(true);
})

test("POST, einfacher Positivtest", async () => {
    // arrange:
    // nichts zu tun

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            campusID: "MP",
            password: "abcABC123!§",
            admin: false
        });

    // assert:
    // Prüfe Response    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Mein Prof");
    expect(response.body.campusID).toBe("MP");
    expect(response.body.admin).toBe(false);
    expect(response.body.password).toBeUndefined();
    expect(response.body.id).toBeDefined();
    // Prüfe Datenbank
    const profs = await getAlleProfs();
    expect(profs
        .some(p => p.id === response.body.id)
    ).toBe(true);

    //testing errors
})

test("POST, einfacher Negativtest", async () => {
    await createProf({ name: "Admin", campusID: "admin2", password: "xyzXYZ123!§xxx", admin: false })
    await performAuthentication("admin2", "xyzXYZ123!§xxx");

    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            campusID: "MP",
            password: "abcABC123!§",
            admin: false
        });

    // assert:
    // Prüfe Response    
    expect(response.status).toBe(403);
    expect(response.text).toBe("ein Prof dar nur von einem Administrator angelegt werden");

})

test("PUT, einfacher Positivtest", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: true
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: profRes.id,
            name: "Anderer Prof",
            campusID: "AP",
            admin: true
        });

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Anderer Prof");
    expect(response.body.campusID).toBe("AP");
    expect(response.body.admin).toBe(true);
    expect(response.body.password).toBeUndefined();
    expect(response.body.id).toBe(profRes.id);
    // Prüfe Datenbank
    const profs = await getAlleProfs();
    // Prüfe Datenbank
    expect(profs
        .some(p => p.id === response.body.id && p.name === "Anderer Prof")
    ).toBe(true);
    const responseFail1 = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: new Types.ObjectId().toString(),
            name: "Anderer Prof",
            campusID: "AP",
        })
    expect(responseFail1.status).toBe(400);

    const responseFail2 = await testee.put(`/api/prof/alle`)
        .send({
            id: profRes.id,
            name: "Anderer Prof",
            campusID: "AP",
        })
    expect(responseFail2.status).toBe(404);
})

test("PUT, einfacher Negativtest", async () => {
    // arrange:
    await createProf({ name: "Admin", campusID: "admin2", password: "xyzXYZ123!§xxx", admin: false })
    await performAuthentication("admin2", "xyzXYZ123!§xxx");
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: true
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: profRes.id,
            name: "Anderer Prof",
            campusID: "AP",
            admin: true
        });
    expect(response.status).toBe(403);

    await createProf({ id: profRes.id,
        name: "Anderer Prof",
        campusID: "AP2",
        password: "sawsd",
        admin: true 
    });
    
    await createProf({ name: "Admin", campusID: "12", password: "xyzXYZ123!§xxx", admin: true })
    await performAuthentication("12", "xyzXYZ123!§xxx");

    const response2 = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: profRes.id,
            name: "Anderer Prof",
            campusID: "AP2",
            admin: false
        });
    expect(response2.status).toBe(400);
})

test("DELETE, einfacher Positivtest", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/prof/${profRes.id}`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(204);
    // Prüfe Datenbank
    expect((await getAlleProfs())
        .every(p => p.id !== profRes.id)
    ).toBe(true);

    //testing errors
    const responseFail1 = await testee.delete(`/api/prof/alle`).send();
    expect(responseFail1.status).toBe(404);

    const wrongId = new Types.ObjectId().toString();
    const responseFail2 = await testee.delete(`/api/prof/${wrongId}`).send();
    expect(responseFail2.status).toBe(404);
})

test("DELETE, einfacher Negativtest", async () => {
    // arrange:
    await createProf({ name: "Admin", campusID: "admin2", password: "xyzXYZ123!§xxx", admin: false })
    await performAuthentication("admin2", "xyzXYZ123!§xxx");

    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/prof/${profRes.id}`).send();

    expect(response.status).toBe(403);

    const prof = await createProf({ name: "Admin", campusID: "admin3", password: "xyzXYZ123!§xxx", admin: true })
    await performAuthentication("admin3", "xyzXYZ123!§xxx");

    const testee2 = supertestWithAuth(app);
    const response2 = await testee2.delete(`/api/prof/${prof.id}`).send();

    expect(response2.status).toBe(403);
    expect(response2.text).toBe("ein Prof darf sich nicht selbst löschen");

})
// Test für GET /api/prof/alle können selbst geschrieben werden.*/