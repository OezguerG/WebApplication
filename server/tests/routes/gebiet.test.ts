import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import { ProfResource } from "../../src/Resources";
import { createGebiet, getAlleGebiete } from "../../src/services/GebietService";
import { createThema, getAlleThemen } from "../../src/services/ThemaService";
import { Types } from "mongoose";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let profMain: ProfResource;
let prof: ProfResource;
let prof2: ProfResource;

beforeEach(async () => {
    profMain = await createProf({ 
        name: "Admin", 
        campusID: "admin", 
        password: "xyzXYZ123!§xxx", 
        admin: true 
    })
    await performAuthentication("admin", "xyzXYZ123!§xxx");
});

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

test("Get Gebiete, einfacher Positivtest", async () => {
    // arrange:
    const gebietRes = await createGebiet({
        name: "Math",
        public: false,
        verwalter: profMain.id!.toString()
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/gebiet/alle`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body[0].name).toBe("Math");
    expect(response.body[0].public).toBe(false);
    expect(response.body[0].verwalter).toContain(profMain.id!.toString());
    // Prüfe Datenbank
    const gebiete = await getAlleGebiete(profMain.id);
    expect(gebiete
        .some(g => g.id === response.body[0].id)
    ).toBe(true);
})


test("POST, einfacher Positivtest", async () => {
    // arrange:
    // nichts zu tun
    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/gebiet")
        .send({
            name: "Math",
            public: true,
            verwalter: profMain.id!.toString()

        });
    // assert:
    // Prüfe Response  
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Math");
    expect(response.body.public).toBe(true);
    expect(response.body.verwalter).toEqual(profMain.id!.toString());
    // Prüfe Datenbank
    const gebiete = await getAlleGebiete();
    expect(gebiete
        .some(g => g.id === response.body.id)
    ).toBe(true);

    //errors
    const response2 = await testee.post("/api/gebiet")
        .send({
            name: "Math",
            public: true,
            verwalter: prof.id!.toString()
        });

    expect(response2.status).toBe(403);
})
test("POST, einfacher Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response2 = await testee.post("/api/gebiet")
        .send({
            name: "Math",
            public: true,
            verwalter: new Types.ObjectId()
        });

    expect(response2.status).toBe(400);
})



test("GET Gebiet, einfacher Positivtest", async () => {
    // arrange:
    const gebietRes = await createGebiet({
        name: "Math",
        public: false,
        verwalter: profMain.id!.toString()
    });

    const thema = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietRes.id!.toString(),
        betreuer: prof.id!.toString()
    });

    const thema2 = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietRes.id!.toString(),
        betreuer: prof2.id!.toString()
    });
    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/gebiet/${gebietRes.id}`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Math");
    expect(response.body.public).toBe(false);
    expect(response.body.anzahlThemen).toBe(2);
    expect(response.body.verwalter).toContain(profMain.id!.toString());
    // Prüfe Datenbank
    const gebiete = await getAlleGebiete(profMain.id);
    expect(gebiete
        .some(g => g.id === response.body.id)
    ).toBe(true);

    //testing errors
    const wrongId1 = new Types.ObjectId().toString();
    const responseFail1 = await testee.get(`/api/gebiet/${wrongId1}`).send();
    expect(responseFail1.status).toBe(404);

})
test("Get Gebiet, einfacher Negativtest", async () => {

    const testee = supertestWithAuth(app);

    const gebietRes2 = await createGebiet({
        name: "Math",
        public: false,
        verwalter: prof.id!.toString()
    });

    const response2 = await testee.get(`/api/gebiet/${gebietRes2.id}`).send();
    expect(response2).statusCode(403)
})


test("PUT, einfacher Positivtest", async () => {
    // arrange:
    const gebietRes = await createGebiet({
        name: "Math",
        public: true,
        verwalter: profMain.id!
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/gebiet/${gebietRes.id}`)
        .send({
            id: gebietRes.id,
            name: "name",
            public: true,
            verwalter: profMain.id!
        });

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("name");
    expect(response.body.public).toBe(true);
    expect(response.body.verwalter).toContain(profMain.id!.toString());
    // Prüfe Datenbank
    const gebiete = await getAlleGebiete();
    // Prüfe Datenbank
    expect(gebiete
        .some(g => g.id === response.body.id && g.name === "name")
    ).toBe(true);

    //testing errors
    const responseFail1 = await testee.put(`/api/gebiet/alle`)
        .send({
            id: gebietRes.id,
            name: "name",
            public: true,
        });
    expect(responseFail1.status).toBe(404);

    const responseFail2 = await testee.put(`/api/gebiet/${gebietRes.id}`)
        .send({
            id: gebietRes.id,
            name: "name",
            public: true,
            verwalter: new Types.ObjectId()
        });
    expect(responseFail2.status).toBe(400);

});
test("PUT, einfacher Negativtest", async () => {
    const gebietRes = await createGebiet({
        name: "Math",
        public: true,
        verwalter: prof.id!
    });

    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/gebiet/${gebietRes.id}`)
        .send({
            id: gebietRes.id,
            name: "name",
            public: true,
            verwalter: prof.id!
        });

    expect(response.status).toBe(403);
});


test("DELETE, einfacher Positivtest", async () => {
    // arrange:
    const gebietRes = await createGebiet({
        name: "Math",
        public: true,
        verwalter: profMain.id!.toString()
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/gebiet/${gebietRes.id}`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(204);
    // Prüfe Datenbank
    expect((await getAlleGebiete())
        .every(g => g.id !== gebietRes.id)
    ).toBe(true);

    //testing errors
    const responseFail1 = await testee.delete(`/api/gebiet/alle`).send();
    expect(responseFail1.status).toBe(404);

    const wrongId = new Types.ObjectId().toString();
    const responseFail2 = await testee.delete(`/api/gebiet/${wrongId}`).send();
    expect(responseFail2.status).toBe(404);
})

test("DELETE, einfacher Negativtest", async () => {
    const gebietRes = await createGebiet({
        name: "Math",
        public: true,
        verwalter: prof.id!.toString()
    });


    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/gebiet/${gebietRes.id}`).send();

    expect(response.status).toBe(403);

})

test("Get Themen, einfacher Positivtest", async () => {
    // arrange:
    const gebietRes = await createGebiet({
        name: "Math",
        public: false,
        verwalter: prof.id!.toString()
    });

    const themenRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietRes.id!.toString(),
        betreuer: profMain.id!.toString()
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/gebiet/${gebietRes.id}/themen`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body[0].titel).toBe("Vektoren");
    expect(response.body[0].beschreibung).toBe("Vektoren sind...");
    expect(response.body[0].status).toBe("reserviert");
    expect(response.body[0].gebiet).toEqual(gebietRes.id!.toString());
    expect(response.body[0].betreuer).toEqual(profMain.id!.toString());
    // Prüfe Datenbank
    const gebiete = await getAlleThemen(gebietRes.id!);
    expect(gebiete
        .some(g => g.id === response.body[0].id)
    ).toBe(true);


    const gebietRes2 = await createGebiet({
        name: "Math",
        public: true,
        verwalter: prof.id!.toString()
    });

    const themenRes2 = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietRes2.id!.toString(),
        betreuer: profMain.id!.toString()
    });
    const response2 = await testee.get(`/api/gebiet/${gebietRes2.id}/themen`).send();

    // assert:
    // Prüfe Response
    expect(response2.status).toBe(200);

})

test("Get Themen, einfacher Negativtest", async () => {
    // arrange:
    const gebietRes = await createGebiet({
        name: "Math",
        public: false,
        verwalter: prof.id!.toString()
    });

    const themenRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebietRes.id!.toString(),
        betreuer: prof.id!.toString()
    });

    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/gebiet/${gebietRes.id}/themen`).send();

    expect(response.status).toBe(403);

})

