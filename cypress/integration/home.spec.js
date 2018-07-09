/// <reference types="cypress" />

import Chance from 'chance';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
const chance = new Chance();

describe('Home', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });

    // /home tests
    // =============================================================
    it('Has page title', () => {
        cy.contains('Cybersecurity curriculum at your fingertips.');
    });

    it('Navbar renders correctly', () => {
        cy.get('.topbar').contains('C.L.A.R.K.');
        // cy.get('.nav-search-bar');
        cy.get('.topbar').contains('Sign in');
        cy.get('.topbar').contains('Register');
    });

    it('Sign in', () => {
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
    });

    it('Register new user', () => {
        cy.contains('Register').click();

        // Assert URL 
        cy.url().should('include', 'register');
    });

    it('Navigate to browse', () => {
        cy.contains('View All').click();

        // Assert URL 
        cy.url().should('include', 'browse');
    });

    it('Navigate to details', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'details');
    });

    it('Clicking display search without entering text does not search', () => {
        cy.contains('Search').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking navbar search without entering text does not search', () => {
        // Click search icon
        cy.get('.topbar').children('.inner.flex.h.left-right').children('.clark-search-wrapper')
            .children('.clark-search-inner').children('clark-search').children('.clark-search')
            .children('.search-options').children('.keyword-search.input').children('form')
            .children('.icon').click();
        
        // Trigger search dropdown
        cy.get('.topbar').children('.inner.flex.h.left-right').children('.clark-search-wrapper')
            .children('.clark-search-inner').children('clark-search').children('.clark-search')
            .children('.search-options').children('.keyword-search.input').children('form')
            .children('input').click();
        
        // Click search icon
        cy.get('.topbar').children('.inner.flex.h.left-right').children('.clark-search-wrapper')
            .children('.clark-search-inner').children('clark-search').children('.clark-search')
            .children('.search-options').children('.keyword-search.input').children('form')
            .children('.icon').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking display search after typing in it', () => {
        // Type in to search bar
        cy.get('.search-input').type('Nick');

        // Click search 
        cy.get('.button.bad').eq(0).click();

        // Assert URL 
        cy.url().should('include', 'query');
    });

    it('Click on contribute button (bottom of home page) while logged out.', () => {
        cy.contains('Contribute to CLARK').click();
        // Assert URL 
        cy.url().should('include', 'login');
    });

    it('Click on contribute button while logged in.', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click contribute button at bottom of page
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');
    });

    it('Navigate to library.', () => {
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

        // Assert URL 
        cy.url().should('include', 'library');
    });

    it('Navigate from library to home by clicking on CLARK logo in navbar.', () => {
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
        cy.get('.topbar').contains('C.L.A.R.K.').click();

        // Assert home URL
        cy.url().should('include', 'home');
    });
   
   

    
});