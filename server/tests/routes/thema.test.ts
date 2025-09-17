import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import { GebietResource, ProfResource } from "../../src/Resources";
import { createGebiet } from "../../src/services/GebietService";
import { createThema, getAlleThemen } from "../../src/services/ThemaService";
import { Types } from "mongoose";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let profMain: ProfResource;
beforeEach(async () => {
    profMain = await createProf({name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })
    await performAuthentication("admin", "xyzXYZ123!§xxx");
});

let prof: ProfResource;
let prof2: ProfResource;
let gebiet: GebietResource;
let gebietMain: GebietResource;

beforeEach(async () => {
    prof = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: true
    });
})

beforeEach(async () => {
    prof2 = await createProf({
        name: "Mein Prof",
        campusID: "MP123",
        password: "abcABC123!§",
        admin: true
    });
})

beforeEach(async () => {
    gebiet = await createGebiet({
        name: "Math",
        public: false,
        verwalter: prof.id!.toString()
    });
})
beforeEach(async () => {
    gebietMain = await createGebiet({
        name: "Math",
        public: false,
        verwalter: profMain.id!.toString()
    });
})


test("GET, einfacher Positivtest", async () => {
    const themaRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: profMain.id!.toString()
    });

    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/thema/${themaRes.id}`).send();

    // assert:
    // Prüfe Response    
    expect(response.status).toBe(200);
    expect(response.body.titel).toBe("Vektoren");
    expect(response.body.beschreibung).toBe("Vektoren sind...");
    expect(response.body.status).toBe("reserviert");
    expect(response.body.gebiet).toEqual(gebiet.id!.toString());
    expect(response.body.betreuer).toContain(profMain.id!.toString());
    // Prüfe Datenbank
    const themen = await getAlleThemen(gebiet.id!.toString());
    expect(themen
        .some(t => t.id === response.body.id)
    ).toBe(true);

    //testing errors
    const wrongId1 = new Types.ObjectId().toString();
    const responseFail1 = await testee.get(`/api/thema/${wrongId1}`).send();
    expect(responseFail1.status).toBe(404);
})

test("GET, einfacher Negativtest", async () => {
    const themaRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: prof.id!.toString()
    });

    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/thema/${themaRes.id}`).send();

    // assert:
    // Prüfe Response    
    expect(response.status).toBe(403);

})

test("POST, einfacher Positivtest", async () => {
    // arrange:
    // nichts zu tun

    // act:

    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/thema")
        .send({
            titel: "Vektoren",
            beschreibung: "Vektoren sind...",
            status: "reserviert",
            gebiet: gebietMain.id!.toString(),
            betreuer: prof.id!.toString()

        });

    // assert:
    // Prüfe Response    
    expect(response.status).toBe(201);
    expect(response.body.titel).toBe("Vektoren");
    expect(response.body.beschreibung).toBe("Vektoren sind...");
    expect(response.body.status).toBe("reserviert");
    expect(response.body.gebiet).toEqual(gebietMain.id!.toString());
    expect(response.body.betreuer).toEqual(prof.id!.toString());
    // Prüfe Datenbank
    const themen = await getAlleThemen(gebietMain.id!.toString());
    expect(themen
        .some(t => t.id === response.body.id)
    ).toBe(true);

    //testing errors
    const responseFail = await testee.post("/api/thema").send({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietMain.id!.toString(),
        betreuer: prof.id!.toString()

    });
    expect(responseFail.status).toBe(201);

    const response2 = await testee.post("/api/thema").send({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietMain.id!.toString(),
        betreuer: prof2.id!.toString()

    });
    expect(response2.status).toBe(201);
})

test("POST, einfacher Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/thema")
        .send({
            titel: "Vektoren",
            beschreibung: "Vektoren sind...",
            status: "reserviert",
            gebiet: gebiet.id!.toString(),
            betreuer: prof.id!.toString()

        });
 
    expect(response.status).toBe(403);
    
})

test("PUT, einfacher Positivtest", async () => {
    // arrange:
    const themaRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietMain.id!.toString(),
        betreuer: prof.id!.toString()
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/thema/${themaRes.id}`)
        .send({
            id: themaRes.id,
            titel: "titel",
            beschreibung: "beschreibung",
            abschluss: "any",
            status: "reserviert",
            gebiet: gebiet.id!.toString(),
            betreuer: prof.id!.toString()

        });

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body.titel).toBe("titel");
    expect(response.body.beschreibung).toBe("beschreibung");
    expect(response.body.status).toBe("reserviert");
    expect(response.body.gebiet).toEqual(gebietMain.id!.toString());
    expect(response.body.betreuer).toEqual(prof.id!.toString());
    // Prüfe Datenbank
    const themen = await getAlleThemen(gebietMain.id!.toString());
    // Prüfe Datenbank
    expect(themen
        .some(t => t.id === response.body.id && t.titel === "titel")
    ).toBe(true);

    const responseFail1 = await testee.put(`/api/thema/alle`).send();
    expect(responseFail1.status).toBe(404);

})

test("PUT, einfacher Negativtest", async () => {
    // arrange:
    const themaRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: prof.id!.toString()
    });

    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/thema/${themaRes.id}`)
        .send({
            id: themaRes.id,
            titel: "titel",
            beschreibung: "beschreibung",
            abschluss: "any",
            status: "reserviert",
            gebiet: gebiet.id!.toString(),
            betreuer: prof.id!.toString()
        });

    expect(response.status).toBe(403);
})

test("DELETE, einfacher Positivtest", async () => {
    // arrange:
    const themaRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietMain.id!.toString(),
        betreuer: prof.id!.toString()
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/thema/${themaRes.id}`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(204);
    // Prüfe Datenbank
    expect((await getAlleThemen(gebietMain.id!.toString()))
        .every(t => t.id !== themaRes.id)
    ).toBe(true);

    //testing errors
    const responseFail1 = await testee.delete(`/api/thema/alle`).send();
    expect(responseFail1.status).toBe(404);
    
    const wrongId = new Types.ObjectId().toString(); 
    const responseFail2 = await testee.delete(`/api/thema/${wrongId}`).send();
    expect(responseFail2.status).toBe(404);
})

test("DELETE, einfacher Negativtest", async () => {
    // arrange:
    const themaRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: prof.id!.toString()
    });


    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/thema/${themaRes.id}`).send();


    expect(response.status).toBe(403);

    const response2 = await testee.delete(`/api/thema/12`).send();
    expect(response2.status).toBe(400);
})