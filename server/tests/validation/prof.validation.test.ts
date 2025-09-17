import { Types } from "mongoose";
import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import "restmatcher"; // Stelle neue Jest-Matcher zur Verfügung
import supertest from "supertest";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";
import { ProfResource } from "../../src/Resources";

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


test("POST, fehlende CampusID", async () => {
    // arrange:
    // nichts zu tun

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            password: "abcABC123!§",
            admin: false
        });

    // assert:
    // Prüfe Response    
    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "campusID"
    })

    createProf({
        name: "Mein Prof",
        password: "abcABC123!§",
        campusID: "123",
        admin: false
    });

    const responseFail = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            password: "abcABC123!§",
            campusID: "123",
            admin: false
        });
    expect(responseFail).toHaveValidationErrorsExactly({
        status: "400",
        body: "campusID"
    })
})

test("PUT, Konsistenz ID in Parameter und Body", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });
    const andererProfRes = await createProf({
        name: "Anderer Prof",
        campusID: "AP",
        password: "abcABC1233!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: andererProfRes.id, // andere ID als in Parameter
            name: "Mein Prof Änderung",
            campusID: "MP",
            admin: false
        });

    // assert:
    // Prüfe Response
    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id", params: "id" // Fehler in Parameter und(!) Body
    })

    const wrongId = new Types.ObjectId().toString();
    const responseFail = await testee.put(`/api/prof/${wrongId}`)
        .send({
            id: wrongId,
            name: "Mein Prof Änderung",
            campusID: "MP",
            admin: false
        });

    expect(responseFail).toHaveValidationErrorsExactly({
        status: "404",
        body: "id", params: "id"
    })
})

test("DELETE, keine MongoID", async () => {
    // arrange:
    // nichts zu tun

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/prof/keineMongoID`).send();

    // assert:
    // Prüfe Response
    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        params: "id"
    })
})

test("post Prof, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.post(`/api/prof`).send({
        name: "",
        campusID: "MP",
        password: "abcABC123!§",
        admin: true
    });


    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        body: ["name"]
    });

});

test("put Prof, Negativtest", async () => {
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: true
    });


    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${profRes.id}`).send({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: true
    });


    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        body: ["id"],
        params: ["id"],
    });

});

test("delete Prof, Negativtest", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/prof/1234}`).send();

    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        params: ["id"],
    });

});
