import { faker } from "@faker-js/faker";

describe("Testes para consulta e criação de filmes", () => {
  let userName = faker.internet.userName();
  let userEmail = faker.internet.email();
  let userPassword = faker.internet.password(8);
  let userToken;
  let userId;
  let ultimoFilme;

  before(function () {
    cy.request("POST", "/api/users", {
      name: userName,
      email: userEmail,
      password: userPassword,
    }).then((response) => {
      userId = response.body.id;
      cy.request("POST", "/api/auth/login", {
        email: userEmail,
        password: userPassword,
      }).then((response) => {
        userToken = response.body.accessToken;
        cy.request({
          method: "PATCH",
          url: "/api/users/admin",
          headers: {
            Authorization: "Bearer " + userToken,
          },
          failOnStatusCode: false,
        });
      });
    });
  });

  it("Cadastrar um novo filme com sucesso", () => {
    cy.request({
      method: "POST",
      url: "/api/movies",
      headers: {
        Authorization: "Bearer " + userToken,
      },
      failOnStatusCode: false,
      body: {
        title: "Velozes e Furiosos 7",
        genre: "Ação",
        description: "Um filme de corrida e aventura",
        durationInMinutes: 240,
        releaseYear: 2015,
      },
    }).then((response) => {
      expect(response.status).to.be.equal(201);
      expect(response.body).to.have.property("id");
    });
  });

  it("Deve receber bad request ao tentar cadastrar um filme sem o título", function () {
    cy.request({
      method: "POST",
      url: "/api/movies",
      headers: {
        Authorization: "Bearer " + userToken,
      },
      failOnStatusCode: false,
      body: {
        genre: "Ação",
        description: "Um filme de corrida e aventura",
        durationInMinutes: 240,
        releaseYear: 2015,
      },
      failOnStatusCode: false,
    })
      .its("status")
      .should("to.equal", 400);
  });

  it("Buscar um filme por ID", () => {
    cy.request({
      method: "GET",
      url: "/api/movies/1",
    }).then((response) => {
      expect(response.status).to.be.equal(200);
      expect(response.body.title).to.be.equal("Filme atualizado");
      expect(response.body.genre).to.be.equal("sadas");
      expect(response.body).to.have.property("genre");
    });
  });

  it("Deve receber bad request ao buscar um filme com um ID inválido", () => {
    cy.request({
      method: "GET",
      url: "/api/movies/d",
      failOnStatusCode: false,
    })
      .its("status")
      .should("to.equal", 400);
  });

  it("Listar filmes", () => {
    cy.request({
      method: "GET",
      url: "/api/movies",
    }).then((response) => {
      ultimoFilme = response.body[response.body.length - 1];
      expect(response.status).to.be.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length > 0).to.equal(true);
    });
  });

  it("Atualizar um filme", function () {
    cy.request({
      method: "PUT",
      url: "/api/movies/" + ultimoFilme.id,
      headers: {
        Authorization: "Bearer " + userToken,
      },
      failOnStatusCode: false,
      body: {
        title: "Avatar",
        genre: "Ficção cientifica",
        description: "Baseado no conflito em Pandora",
        durationInMinutes: 162,
        releaseYear: 2009,
      },
    }).then(function (response) {
      expect(response.status).to.equal(204);
    });
  });

  it("Deletar um filme", function () {
    cy.request({
      method: "DELETE",
      url: "/api/movies/" + ultimoFilme.id,
      headers: {
        Authorization: "Bearer " + userToken,
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(204);
    });
  });

  it("Deve receber um bad request ao tentar deletar um filme sem inserir o ID", function () {
    cy.request({
      method: "DELETE",
      url: "/api/movies/",
      headers: {
        Authorization: "Bearer " + userToken,
      },
      failOnStatusCode: false,
    })
      .its("status")
      .should("to.equal", 404);
  });
});
