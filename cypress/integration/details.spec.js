 /// <reference types="cypress" />

import Chance from 'chance';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
const chance = new Chance();

describe('Details', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
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
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    // it('Navigate to details and click DOWNLOAD NOW button when logged out', () => {
    //     // Wait for learning objects to load on page
    //     cy.wait(1000);

    //     // Click left-most card
    //     cy.get('.learning-object').first().click({ multiple: true });

    //     // Click DOWNLOAD NOW button 
    //     // if disabled class is present, it is working correctly.
    //     cy.get('.inner').eq(1).children('.button.good.disabled').click();

    //     // Assert URL 
    //     cy.url().should('include', 'details');
    // });
});