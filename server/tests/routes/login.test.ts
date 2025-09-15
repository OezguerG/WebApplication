import { parseCookies } from "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";

const prevSec = process.env.JWT_SECRET;
const prevTTL = process.env.JWT_TTL;

afterEach(() => {
    process.env.JWT_SECRET = prevSec;
    process.env.JWT_TTL = prevTTL;
})

test(`/api/login POST, Positivtest`, async () => {
    // arrange:
    await createProf({ name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })

    // act:
    const testee = supertest(app);
    const loginData = { campusID: "admin", password: "xyzXYZ123!§xxx" };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));

    const token = response.cookies.access_token;
    expect(token).toBeDefined();
});

test(`/api/login POST, Negativtest`, async () => {

    const secret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "";
    await createProf({ name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })


    const testee = supertest(app);
    const loginData = { campusID: "admin", password: "xyzXYZ123!§xxx" };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));


    expect(response).statusCode("500")

    expect(response.body).toEqual({ error: "Environment variables JWT_SECRET and JWT_TTL must be defined." });

    process.env.JWT_SECRET = secret;
    
    const loginData2 = { campusID: "", password: "xyzXYZ123!§xxx" };
    const response2 = parseCookies(await testee.post(`/api/login`).send(loginData2));
    expect(response2).statusCode("400")

    const loginData3 = { campusID: "ad", password: "xyzXYZ123!§xxx" };
    const response3 = parseCookies(await testee.post(`/api/login`).send(loginData3));
    expect(response3).statusCode("401")
    expect(response3.text).toContain("Ungültige Campus-ID oder Passwort")
});

test(`/api/login GET, Positivtest`, async () => {
    // arrange:
    await createProf({ name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })

    // act:
    const testee = supertest(app);
    const loginData = { campusID: "admin", password: "xyzXYZ123!§xxx" };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    const token = response.cookies.access_token;
    expect(token).toBeDefined();

    const response2 = parseCookies(
        await testee.get(`/api/login`).set("cookie", `access_token=${token}`)
    );

    expect(response2).statusCode("2*")

});

test(`/api/login GET, Negativtest`, async () => {
    // arrange:
    await createProf({ name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })

    // act:
    const testee = supertest(app);
    const loginData = { campusID: "admin", password: "xyzXYZ123!§xxx" };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    const token = response.cookies.access_token;
    expect(token).toBeDefined();


    const token2 = undefined;
    const response2 = parseCookies(
        await testee.get(`/api/login`).set("cookie", `access_token=${token2}`)
    );
    expect(response2).statusCode(400)
    expect(response2.body).toEqual({ error: "JWT is undefined or empty" })


    delete process.env.JWT_SECRET
    const response3 = parseCookies(
        await testee.get(`/api/login`).set("cookie", `access_token=${token}`)
    );
    expect(response3).statusCode(500)
    expect(response3.body).toEqual({ error: "Environment variable JWT_SECRET must be defined" })


    process.env.JWT_SECRET = prevSec
    const token3 = "12"
    const response4 = parseCookies(
        await testee.get(`/api/login`).set("cookie", `access_token=${token3}`)
    );
    expect(response4).statusCode(400)
    expect(response4.body).toEqual(false)

});

test(`/api/login DELETE, Positivtest`, async () => {
    // arrange:
    await createProf({ name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })

    // act:
    const testee = supertest(app);
    const loginData = { campusID: "admin", password: "xyzXYZ123!§xxx" };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    const token = response.cookies.access_token;
    expect(token).toBeDefined();


    const response2 = parseCookies(
        await testee.get(`/api/login`).set("cookie", `access_token=${token}`)
    );
    expect(response2).statusCode(200)

    const response3 = parseCookies(
        (await testee.delete(`/api/login`))
    );
    expect(response3).statusCode(200)
    expect(response3.text).toEqual("Logged out")

    const response4 = parseCookies(
        await testee.get(`/api/login`)
    );
    expect(response4).statusCode(401)
});
