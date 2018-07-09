 /// <reference types="cypress" />

import Chance from 'chance';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
const chance = new Chance();

describe('User', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });   
    // =============================================================
    // /user testing
    // =============================================================
    it('Navigate to organization members page', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Click author name
        cy.get('.author').children('.link').first().click({ multiple: true });

        // Click organization link 
        cy.get('.organization').children('a').click();

        // Assert URL 
        cy.url().should('include', 'organization');
    });

    it('Navigate to personal profile page', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Wait for sign in process
        cy.wait(1000);

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');
    });

    it('Navigate to personal profile page and click edit profile', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Check for new page content 
        cy.contains('Edit Profile');
    });

    it('Navigate to personal profile page and click edit profile and click DISCARD CHANGES', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Click Discard Changes
        cy.get('.button.bad').click();

        // Check for new page content
        cy.get('.title');
    });

    it('Navigate to personal profile page and click edit profile and click SAVE', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Fill out name input 
        cy.get('input[name=firstname]').clear();
        cy.get('input[name=firstname]').type('Randy');

        // Click Save
        cy.get('.button.good').click();

        // Check for new name
        cy.contains('Randy');

         // Click Edit Profile
         cy.get('.edit').children('span').first().click();

         // Fill out name input 
         cy.get('input[name=firstname]').clear();
         cy.get('input[name=firstname]').type('Nick');
 
         // Click Save
         cy.get('.button.good').click();
 
         // Check for new name
         cy.contains('Nick');
    });

    it('Navigate to personal profile page and enter correct password to see if inputs appear', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Fill out name input 
        cy.get('input[name=password]').type('122595');
    
        // Check for new fields 
        cy.get('input[name="new password"]');
    });
});