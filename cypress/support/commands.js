
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
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Login help method 
Cypress.Commands.add('login', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true });

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('testaccount');
    cy.get('input[name=password]').type('password12345!');
    cy.get('#auth-button').click();
});

// Login help method (verified email)
Cypress.Commands.add('verifiedlogin', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true });

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('emailtestaccount');
    cy.get('input[name=password]').type('password');
    cy.get('#auth-button').click();
});

// Method that prevents uncaught exceptions from failing otherwise working tests
// This is referenced in the learning object builder testing
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})
