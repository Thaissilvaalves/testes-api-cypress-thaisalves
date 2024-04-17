import { faker } from "@faker-js/faker";

describe("Testes de usuário", function () {
  let userId;
  let userName = faker.internet.userName();
  let userEmail = faker.internet.email();
  let userPassword = faker.internet.password(8);
  let userToken;

  describe("Testes de criação de usuário", function () {
    it("Cadastrar um novo usuário", () => {
      cy.request("POST", "/api/users", {
        name: userName,
        email: userEmail,
        password: userPassword,
      }).then((response) => {
        userId = response.body.id;
        cy.log(userId);
        expect(response.status).to.be.equal(201);
        expect(response.body).to.be.an("object");
      });
    });

    it("Buscar informações de um usuário", () => {
      cy.request("POST", "/api/auth/login", {
        email: userEmail,
        password: userPassword,
      }).then((response) => {
        userToken = response.body.accessToken;
        cy.request({
          method: "GET",
          url: "/api/users/" + userId,
          headers: {
            Authorization: "Bearer " + userToken,
          },
        }).then((response) => {
          expect(response.status).to.be.equal(200);
          expect(response.body.name).to.equal(userName);
          expect(response.body.email).to.equal(userEmail);
          expect(response.body.active).to.equal(true);
          expect(response.body.type).to.equal(0);
        });
      });
    });

    it("Não deve ser possível cadastrar usuário com e-mail já utilizado", function () {
      cy.request({
        method: "POST",
        url: "/api/users/",
        body: {
          name: userName,
          email: userEmail,
          password: userPassword,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(409);
        expect(response.body.error).to.equal("Conflict");
        expect(response.body.message).to.equal("Email already in use");
      });
    });
  });

  describe("Testes de Bad Requests para criação de usuário", function () {
    it("Deve receber bad request ao tentar cadastrar um usuário sem e-mail", function () {
      cy.request({
        method: "POST",
        url: "/api/users/",
        body: {
          name: userName,
          password: userPassword,
        },
        failOnStatusCode: false,
      })
        .its("status")
        .should("to.equal", 400);
    });

    it("Deve receber bad request ao tentar cadastrar um usuário sem nome", function () {
      cy.request({
        method: "POST",
        url: "/api/users/",
        body: {
          email: userEmail,
          password: userPassword,
        },
        failOnStatusCode: false,
      })
        .its("status")
        .should("to.equal", 400);
    });

    it("Deve receber bad request ao tentar cadastrar um usuário sem senha", function () {
      cy.request({
        method: "POST",
        url: "/api/users/",
        body: {
          name: userName,
          email: userEmail,
        },
        failOnStatusCode: false,
      })
        .its("status")
        .should("to.equal", 400);
    });
  });

  describe("Testes de consulta de usuário", function () {
    it("Não é possível um usuário comum checar todos os usuários", function () {
      cy.log(userToken);
      cy.request({
        method: "GET",
        url: "/api/users",
        headers: {
          Authorization: "Bearer " + userToken,
        },
        failOnStatusCode: false,
      }).then(function (response) {
        expect(response.status).to.equal(403);
        expect(response.body.message).to.equal("Forbidden");
      });
    });

    it("Admin pode checar todos os usuários", function () {
      cy.request({
        method: "PATCH",
        url: "/api/users/admin",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }).then(function () {
        cy.request({
          method: "GET",
          url: "/api/users",
          headers: {
            Authorization: "Bearer " + userToken,
          },
        }).then(function (response) {
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an("array");
        });
      });
    });
  });

  describe("Teste de deletar um usuário", function () {
    it("Deletar um usuário", function () {
      cy.request({
        method: "DELETE",
        url: "/api/users/" + userId,
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }).then(function (response) {
        expect(response.status).to.equal(204);
      });
    });
  });
});
