import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import supertest from "supertest";
import { GebietResource, ProfResource, ThemaResource } from "../../src/Resources";
import { createGebiet, getAlleGebiete } from "../../src/services/GebietService";
import { createThema, getAlleThemen } from "../../src/services/ThemaService";
import { Types } from "mongoose";
import "restmatcher";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

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

test("Get Gebiet, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const wrongId1 = "1234";
    const response = await testee.get(`/api/gebiet/${wrongId1}`).send();

    
    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        params: ["id"]
    });

});

test("post Gebiet, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.post(`/api/gebiet`).send({
        name: "",
        public: true,
        verwalter: profMain.id!.toString()
    });

    
    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        body: ["name"]
    });
});

test("put Gebiet, Negativtest", async () => {
    const gebietRes = await createGebiet({
        name: "Mathe",
        public: true,
        verwalter: profMain.id!.toString()
    });
    
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/gebiet/${gebietRes.id}`).send({
        name: "Mathe",
        public: true,
        verwalter: profMain.id!.toString()
    });

    
    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        body: ["id"],
    });

    
    const wrongId = new Types.ObjectId().toString();
    const responseFail2 = await testee.put(`/api/gebiet/${wrongId}`)
        .send({
            id: wrongId,
            name: "name",
            public: true,
            verwalter: profMain.id!.toString()
        });
    expect(responseFail2).toHaveValidationErrorsExactly({
        status: 404,
        params: ["id"],
    });;
});

test("delete Gebiet, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/gebiet/1234}`).send();

    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        params: ["id"],
    });

    const gebietRes = await createGebiet({
        name: "Mathe",
        public: true,
        verwalter: profMain.id!.toString()
    });
    
    await createThema({
        titel: "Vektoren",
        beschreibung: " wawa",
        status: "offen",
        gebiet: gebietRes.id!.toString(),
        betreuer: profMain.id!.toString()
    });

    const responseFail2 = await testee.delete(`/api/gebiet/${gebietRes.id}`).send();
    expect(responseFail2).toHaveValidationErrorsExactly({
        status: 500,
        params: ["id"]
    });

    const responseFail3 = await testee.delete(`/api/gebiet/${new Types.ObjectId().toString()}`).send();
    expect(responseFail3).toHaveValidationErrorsExactly({
        status: 404,
        params: ["id"]
    });;
});

test("Get Themen im Gebiet, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const wrongId1 = "1234";
    const response = await testee.get(`/api/gebiet/${wrongId1}/themen`).send();
    
    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        params: ["id"]
    });

    const wrongId2 = new Types.ObjectId().toString();
    const responseFail1 = await testee.get(`/api/gebiet/${wrongId2}`).send();
    expect(responseFail1.status).toBe(404);
    expect(responseFail1).toHaveValidationErrorsExactly({
        status: 404,
        params: ["id"]
    });

    const wrongId3 = new Types.ObjectId().toString();
    const responseFail2 = await testee.get(`/api/gebiet/${wrongId3}/themen`).send();
    expect(responseFail2).toHaveValidationErrorsExactly({
        status: 404,
        params: ["id"]
    });
});
