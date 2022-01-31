const chai = require("chai");
const chaiHttp = require("chai-http");
const defaultServer = process.env.TEST_SERVER || "http://localhost:3000";

chai.use(chaiHttp);

const expect = chai.expect;

describe("User", () => {
  describe("findMany", () => {
    it("should reject get many users with invalid token", (done) => {});

    it("should return many users with length of 25", (done) => {});

    it("should return many users filter by query with length of 25", (done) => {});

    it("should return many users with length of 5", (done) => {});

    it("should return many users with length of 5 start from offset 6", (done) => {});

    it("should return many users with length of 25 order by name ascending", (done) => {});
  });

  describe("createUser", () => {
    it("should reject create user with invalid token", (done) => {});

    it("should failed to create user with invalid email", (done) => {});

    it("should failed to create user with blank email", (done) => {});

    it("should failed to create user with blank password", (done) => {});

    it("should failed to create user with mismatch password and confirm password", (done) => {});

    it("should failed to create user with duplicate username", (done) => {});

    it("should failed to create user with duplicate email", (done) => {});

    it("should create a user", (done) => {});
  });

  describe("updateMany", () => {
    it("should reject update many user with invalid token", (done) => {});

    it("should failed to update user's password");
  });
});
