import { faker } from "@faker-js/faker";

describe("Testes de rotas /filmes", () => {
  let userName = faker.internet.userName();
  let userEmail = faker.internet.email();
  let userPassword = faker.internet.password(8);
  let userToken;
  let userId;
  let ultimoFilme;
  let filmeId;

  before(function () {
    cy.criarUsuario(userName, userEmail, userPassword).then((response) => {
      userId = response.body.id;
      cy.fazerLogin(userEmail, userPassword).then((response) => {
        userToken = response.body.accessToken;
        cy.tornarAdmin(userToken);
      });
    });
  });
  describe("Testes de criação de filmes", function () {
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
        filmeId = response.body.id;
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
  });

  describe("Testes de consulta e atualização de filmes", function () {
    it("Deve ser possível buscar um filme por ID", () => {
      cy.request({
        method: "GET",
        url: "/api/movies/" + filmeId,
      }).then((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body.title).to.be.equal("Velozes e Furiosos 7");
        expect(response.body.genre).to.be.equal("Ação");
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

    it("Deve ser possível listar filmes", () => {
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

    it("Deve ser possível atualizar um filme", function () {
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

    describe("Testes de reviews de filmes", function () {
      it("Deve ser possível fazer a review de um filme", function () {
        cy.request({
          method: "POST",
          url: "/api/users/review",
          headers: {
            Authorization: "Bearer " + userToken,
          },
          body: {
            movieId: filmeId,
            score: 5,
            reviewText: "Filme muito bem elaborado",
          },
        }).then(function (response) {
          expect(response.status).to.equal(201);
        });
      });

      it("Deve ser possível listar reviews de filmes", () => {
        cy.request({
          method: "GET",
          url: "/api/users/review/all",
          headers: {
            Authorization: "Bearer " + userToken,
          },
        }).then((response) => {
          expect(response.status).to.be.equal(200);
          expect(response.body).to.be.an("array");
          expect(response.body.length > 0).to.equal(true);
        });
      });

      it("Deve receber bad request ao tentar fazer um review sem score", function () {
        cy.request({
          method: "POST",
          url: "/api/users/review",
          headers: {
            Authorization: "Bearer " + userToken,
          },
          body: {
            movieId: filmeId,
            reviewText: "Filme muito bem elaborado",
          },
          failOnStatusCode: false,
        })
          .its("status")
          .should("to.equal", 400);
      });

      it("Deve receber bad request ao tentar fazer um review sem descrever um texto", function () {
        cy.request({
          method: "POST",
          url: "/api/users/review",
          headers: {
            Authorization: "Bearer " + userToken,
          },
          body: {
            movieId: filmeId,
            score: 5,
          },
          failOnStatusCode: false,
        })
          .its("status")
          .should("to.equal", 400);
      });
    });
    describe("Testes de exclusão de filmes", function () {
      it("Deve ser possível deletar um filme", function () {
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
  });
});
