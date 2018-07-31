 /// <reference types="cypress" />

import { SSL_OP_CISCO_ANYCONNECT } from 'constants';

describe('Library', () => {

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });   
    // =============================================================
    // /library testing
    // =============================================================
    it('Navigate from library to browse.', () => {
        // Login 
        cy.login();

        // Click contribute button at bottom of page
        cy.get('.right.library').click();

        // Assert library URL 
        cy.url().should('include', 'library');

        // Return to home page 
        cy.contains('browsing some learning objects!').click();

        // Assert home URL
        cy.url().should('include', 'browse');
    });
});