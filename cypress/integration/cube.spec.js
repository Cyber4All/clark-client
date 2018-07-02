/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

describe('Cube', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });

    it('Has page title', () => {
        cy.contains('Cybersecurity curriculum at your fingertips.');
    });

    it('Navbar renders correctly', () => {
        cy.get('.topbar').contains('C.L.A.R.K.');
        cy.get('input[placeholder=Search...]');
        cy.get('.topbar').contains('Sign in');
        cy.get('.topbar').contains('Register');
    });

    it('Sign in', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

    });

    it('Register new user', () => {
        cy.contains('Register');
    });
});