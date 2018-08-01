 /// <reference types="cypress" />

import { SSL_OP_CISCO_ANYCONNECT } from 'constants';

describe('Details', () => {

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
    });   
    // =============================================================
    // /details testing
    // =============================================================
    it('Navigate to details and click on author name to view author profile', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Click author name
        cy.get('.author').children('.link').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');
    });

    it('Navigate to details and click on login button', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Click author name
        cy.get('.login-msg').children('a').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info
        // Different steps for login - don't replace with helper method
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Navigate to details and click DOWNLOAD NOW button when logged out', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Click DOWNLOAD NOW button 
        // if disabled class is present, it is working correctly.
        cy.wait(1000);
        cy.get('.sidebar').children('.inner').children('.btn-group.vertical').children('.button.good.disabled');

        // Assert URL 
        cy.url().should('include', 'details');
    });
});