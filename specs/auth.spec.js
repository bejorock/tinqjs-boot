const chai = require("chai");
const chaiHttp = require("chai-http");
const defaultServer = process.env.TEST_SERVER || "http://localhost:3000";

chai.use(chaiHttp);

const expect = chai.expect;

describe("Authorization", () => {
  describe("authorize", () => {
    const path = "/api/auth/authorize";

    it("should authorize valid user", (done) => {
      chai
        .request(defaultServer)
        .post(path)
        .send({
          user_id: "root@app.id",
          password: "P@ssw0rd",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);

          // expect to have valid
          expect(res.body).to.have.property("access_token");
          expect(res.body).to.have.property("claims");
          expect(res.body.claims).to.have.property("sub");
          expect(res.body.claims).to.have.property("name");
          expect(res.body.claims).to.have.property("preferred_username");

          done();
        });
    });

    it("should reject user with invalid password", (done) => {
      chai
        .request(defaultServer)
        .post(path)
        .send({
          user_id: "root@app.id",
          password: "wrongpassword",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);

          done();
        });
    });

    it("should reject user with invalid email", (done) => {
      chai
        .request(defaultServer)
        .post(path)
        .send({
          user_id: "superadmin@app.id",
          password: "P@ssw0rd",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(404);

          done();
        });
    });

    it("should have valid session for two weeks if remember_me is true", (done) => {});
  });

  describe("token", () => {
    const path = "/api/auth/token";

    it("should create a new access token", (done) => {});

    it("should reject create token with invalid refresh_token", (done) => {});

    it("should reject create token with expired refresh_token", (done) => {});
  });

  describe("me", () => {
    const path = "/api/auth/me";

    it("should get user's claims with valid access_token", (done) => {});

    it("should reject user's claims with invalid access_token", (done) => {});

    it("should reject user's claims with expired access_token", (done) => {});
  });

  describe("logout", () => {
    const path = "/api/auth/logout";

    it("should clear user session for valid access_token", (done) => {});
  });
});
