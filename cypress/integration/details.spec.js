 /// <reference types="cypress" />

import { SSL_OP_CISCO_ANYCONNECT } from 'constants';

describe('Details', () => {

    let creds; 

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
        cy.fixture('creds.json').then((cred) => {
            creds = cred;
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
        cy.get('input[name=username]').type(creds[0]);
        cy.get('input[name=password]').type(creds[1]);
        cy.get('.auth-button').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

     it('Navigate to details and clicking the rating to scroll page', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // TODO all login code can be removed when pulling ratings from server
        // Click author name
        cy.get('.topbar .login').click();

        // Assert URL 
        cy.url().should('include', 'login');

        cy.wait(1000);

        // Enter login info
        // Different steps for login - don't replace with helper method
        cy.get('input[name=username]').type('nwinne1');
        cy.get('input[name=password]').type('testpassword');
        cy.get('.auth-button').click();

        cy.wait(1000);

        cy.url().should('include', 'details');

        cy.get('.rating > clark-rating-stars').first().click({  multiple: true });

        cy.window().then(($w) => {
            cy.get('.ratings').invoke('offset').its('top').should(($p) => {
                expect($p - $w.scrollY).to.be.at.most(200)
            });      
        })
     });

     it('Navigate to details and clicking on \'Write a review\'', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // ensure that when not logged in, option doesn't exist
        cy.get('.rating > a').should('not.exist');

        // login
        cy.login();

        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        cy.get('.rating > a').first().click({  multiple: true });

        cy.get('.new-rating-wrapper').should('be.visible').should('have.class', 'active');
        cy.get('.new-rating').should('be.visible');
     });

    //  it('From details page, click \'report\' on a rating', () => {
    //     // Wait for learning objects to load on page
    //     cy.visit('http://localhost:4200/details/dark/Cybersecurity%20and%20Society');

    //     cy.wait(1000);

    //     cy.visit('.rating-list-element .options').first().click({multiple: true})
    //  })

    // it('Navigate to details and click DOWNLOAD NOW button when logged out', () => {
    //     // Wait for learning objects to load on page
    //     cy.wait(1000);
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
