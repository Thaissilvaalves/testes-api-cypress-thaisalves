// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("deletarUsuario", function (id, token) {
  return cy.request({
    method: "DELETE",
    url: "/api/users/" + id,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
});

Cypress.Commands.add("criarUsuario", function (name, email, password) {
  return cy.request({
    method: "POST",
    url: "/api/users/",
    body: {
      name: name,
      email: email,
      password: password,
    },
  });
});

Cypress.Commands.add("fazerLogin", function (email, password) {
  return cy.request({
    method: "POST",
    url: "/api/auth/login",
    body: {
      email: email,
      password: password,
    },
  });
});

Cypress.Commands.add("tornarAdmin", function (token) {
  return cy.request({
    method: "PATCH",
    url: "/api/users/admin",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
});

Cypress.Commands.add("promoverCritico", function (token) {
  return cy.request({
    method: "PATCH",
    url: "/api/users/apply",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
});
