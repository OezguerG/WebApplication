import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import supertest from "supertest";
import { GebietResource, ProfResource } from "../../src/Resources";
import { createGebiet } from "../../src/services/GebietService";
import { createThema } from "../../src/services/ThemaService";
import "restmatcher";
import { Types } from "mongoose";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let prof: ProfResource;
let gebiet: GebietResource;
let profMain: ProfResource;

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
    gebiet = await createGebiet({
        name: "Math",
        public: true,
        verwalter: prof.id!.toString()
    });
})

test("Get Thema, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const wrongId1 = "1234";
    const response = await testee.get(`/api/thema/${wrongId1}`).send();

    
    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        params: ["id"]
    });

});

test("post Thema, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.post(`/api/thema`).send({
        titel: "Vektoren",
        beschreibung: "",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: profMain.id!.toString()
    });
    
    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        body: ["beschreibung"]
    });

    const wrongId = new Types.ObjectId().toString();
    const responseFail = await testee.post(`/api/thema`).send({
        titel: "Vektoren",
        beschreibung: "wawa",
        status: "reserviert",
        gebiet: wrongId,
        betreuer: prof.id!.toString()
    });

    expect(responseFail).toHaveValidationErrorsExactly({
        status: 404,
        body: ["gebiet"]
    });

    const gebietTest = await createGebiet({
        name: "Math",
        public: false,
        closed: true,
        verwalter: profMain.id!.toString()
    });

    const responseFail2 = await testee.post(`/api/thema`).send({
        titel: "Vektoren",
        beschreibung: "wawa",
        status: "reserviert",
        gebiet: gebietTest.id,
        betreuer: profMain.id!.toString()
    });
    
    expect(responseFail2).toHaveValidationErrorsExactly({
        status: 400,
        body: ["gebiet"]
    });

    const wrongId2 = new Types.ObjectId().toString();
    const responseFail3 = await testee.post(`/api/thema`).send({
        titel: "Vektoren",
        beschreibung: "wawa",
        status: "reserviert",
        gebiet: gebiet.id,
        betreuer: wrongId2
    });

    expect(responseFail3).toHaveValidationErrorsExactly({
        status: 400,
        body: ["betreuer"]
    });
});

test("put Thema, Negativtest", async () => {
    const themaRes = await createThema({
        titel: "Vektoren",
        beschreibung: "Vektoren sind...",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: profMain.id!.toString()
    });

    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/thema/${themaRes.id}`).send({
        titel: "Vektoren",
        beschreibung: "Ve",
        abschluss: "any",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: profMain.id!.toString()
    });
    
    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        body: ["id"],
        params: ["id"],
    });
    
    const wrongId = new Types.ObjectId().toString();
    const responseFail = await testee.put(`/api/thema/${wrongId}`).send({
        id: wrongId,
        titel: "Vektoren",
        beschreibung: "Ve",
        abschluss: "any",
        status: "reserviert",
        gebiet: gebiet.id!.toString(),
        betreuer: profMain.id!.toString()
    });
    expect(responseFail).toHaveValidationErrorsExactly({
        status: 404,
        body: ["id"],
    });

});

test("delete Thema, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/thema/1234}`).send();

    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        params: ["id"],
    });

});

