 /// <reference types="cypress" />

import Chance from 'chance';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
const chance = new Chance();

describe('Library', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });   
    // =============================================================
    // /library testing
    // =============================================================
    it('Navigate from library to browse.', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

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