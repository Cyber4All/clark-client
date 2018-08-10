 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************

describe('Library', () => {

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
    });   
    // =============================================================
    // /library testing
    // =============================================================
    it('Navigate from library to browse.', () => {
        // Login 
        cy.login();

        // Click contribute button at bottom of page
        cy.get('#library-link').click();

        // Assert library URL 
        cy.url().should('include', 'library');

        // Return to home page 
        cy.get('#browse-message').click();

        // Assert home URL
        cy.url().should('include', 'browse');
    });
});