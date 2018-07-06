 /// <reference types="cypress" />

import Chance from 'chance';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
const chance = new Chance();

describe('Cube', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });   
    // =============================================================
    // /dashboard testing
    // =============================================================
    it('Navigate to dashboard', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click on contributor option in navbar
        // cy.get('.topbar').children('.inner.flex.h.left-right').children('.user.loggedin.flex.h.flex-end').children('.contributor').click();

        // navigate to Your Dashboard
        // cy.get('.popup.dropdown').eq(1).children('ul').first().children('li').click({ multiple: true });
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');
    });

    it('Navigate to dashboard and click new +', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click on contributor option in navbar
        // cy.get('.topbar').children('.inner.flex.h.left-right').children('.user.loggedin.flex.h.flex-end').children('.contributor').click();

        // navigate to Your Dashboard
        // cy.get('.popup.dropdown').eq(1).children('ul').first().children('li').click({ multiple: true });
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        //Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Assert URL
        cy.url().should('include', 'learning-object-builder');
    });

    it('Click checkboxes and look for delete button to appear', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click on contributor option in navbar
        // cy.get('.topbar').children('.inner.flex.h.left-right').children('.user.loggedin.flex.h.flex-end').children('.contributor').click();

        // navigate to Your Dashboard
        // cy.get('.popup.dropdown').eq(1).children('ul').first().children('li').click({ multiple: true });
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click checkbox
        cy.get('.rows').eq(1).children('.row.unpublished').children('clark-checkbox').children('.checkbox').click();

         //Assert delete button has appeared
         cy.get('.top').children('.actions.btn-group.to-right').children('.filter.bad.button');
  
    });

    it('Click object to edit it', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click object
        cy.get('.rows').eq(1).children('.row.unpublished').children('.cells').children('.cell').first().children('.builder-link').click();

        // Assert URL
        cy.url().should('include', 'learning-object-builder');
    });

    it('Navigate to dashboard and click existing object to edit it - through options', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        // cy.get('.popup.dropdown').eq(1).children('ul').first().children('li').click({ multiple: true });
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click Edit from options dropdown
        cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
        cy.get('.popup.small').eq(1).children('ul').children('li').first().click();

         // Assert URL
         cy.url().should('include', 'learning-object-builder');
    });

    it('Navigate to dashboard and manage materials for an object', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

         // Click Edit from options dropdown
         cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
         cy.get('.popup.small').eq(1).children('ul').children('li').eq(1).click();

         // Assert URL
         cy.url().should('include', 'onion');
    });

    it('Navigate to dashboard and assert publish option', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

         // Click Edit from options dropdown
         cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
         cy.get('.popup.small').eq(1).children('ul').children('li').eq(2);
    });

    it('Navigate to dashboard and assert delete option', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

         // Click Edit from options dropdown
         cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
         cy.get('.popup.small').eq(1).children('ul').children('li').eq(3);
    });

    it('Save learning object', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click object
        cy.get('.rows').eq(1).children('.row.unpublished').children('.cells').children('.cell').first().children('.builder-link').click();

        // Click Save button
        cy.get('.top-content').children('.right').children('.btn-group.to-right').click();
    });

    it('Click next until returned to dashboard', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click object
        cy.get('.rows').eq(1).children('.row.unpublished').children('.cells').children('.cell').first().children('.builder-link').click();

        // Click Next button
        cy.get('.next.button.neutral.on-white').click();

        // Click Next button
        cy.get('.next.button.neutral.on-white').click();

        // Wait for page load so that button 
        // on previous page with same selector is not asserted
        cy.wait(1000);

        // Click save button at end of builder
        cy.get('.button.good').eq(1).click();

        // Assert URL
        cy.url().should('include', 'dashboard');
    });
});