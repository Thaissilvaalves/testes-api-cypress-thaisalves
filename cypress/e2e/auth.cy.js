import { faker } from "@faker-js/faker";

describe("Testes de autenticação de usuário", () => {
  let userId;
  let userName = faker.internet.userName();
  let userEmail = faker.internet.email();
  let userPassword = faker.internet.password(8);
  let userToken;

  before(function () {
    cy.request("POST", "/api/users", {
      name: userName,
      email: userEmail,
      password: userPassword,
    }).then((response) => {
      userId = response.body.id;
    });
  });

  it("Usuário consegue logar com sucesso", function () {
    cy.request("POST", "/api/auth/login", {
      email: userEmail,
      password: userPassword,
    }).then((response) => {
      userToken = response.body.accessToken;
      cy.log(userId);
      expect(response.status).to.be.equal(200);
      expect(response.body.accessToken).to.be.an("string");
    });
  });

  it("Deve receber bad request ao tentar logar sem email", function () {
    cy.request({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "",
        password: userPassword,
      },
      failOnStatusCode: false,
    })
      .its("status")
      .should("to.equal", 400);
  });

  it("Deve receber bad request ao tentar logar sem senha", function () {
    cy.request({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: userEmail,
        password: "",
      },
      failOnStatusCode: false,
    })
      .its("status")
      .should("to.equal", 400);
  });
});
