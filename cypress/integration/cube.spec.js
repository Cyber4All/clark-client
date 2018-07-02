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
});