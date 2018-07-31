 /// <reference types="cypress" />

import { SSL_OP_CISCO_ANYCONNECT } from 'constants';

describe('Browse', () => {

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4200/home');
    });   
    // =============================================================
    // /register testing
    // =============================================================
    it('Use Sign in link located in registration footer', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Click link
        cy.get('.bottom-link').children('span').click();

        // Assert URL
        cy.url().should('include', 'login');
    });

    it('Assert registration header', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Assert header
        cy.get('.content-box').children('.top').children('.auth-title').contains('C.L.A.R.K.');

        // Assert light header
        cy.get('.content-box').children('.top').children('.auth-title.light').contains('Cybersecurity Labs and Resource Knowledge-base');

        // Assert step 1 header
        cy.get('.auth-title.light').eq(1).contains('Tell Us About Yourself');
    });

    it('Click next arrow without filling in anything', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Click next arrow - only fill in first name', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Click next arrow - only fill in last name', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Click next arrow - only fill in email - one not in use already', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Click next arrow - only fill in organization', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Click next arrow - only fill in first name and last name', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Click next arrow - only fill in first name, last name, and email', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Click next arrow - trigger invalid email error - already in use', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email - should be in use
        cy.get('.input.email').children('input').type('nvisal1@students.towson.edu');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('This email is already taken');
    });

    it('Click next arrow - trigger invalid email error - invalid format', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email - should be in use
        cy.get('.input.email').children('input').type('invalid format');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please enter a valid email');
    });

    it('Click next arrow - trigger organization results to block next button', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email - should be in use
        cy.get('.input.email').children('input').type('invalid format');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson');

        // Wait for ui to appear
        cy.wait(1000);

        // Assert organization dropdown 
        cy.get('#container');
    });

    it('Click next arrow - enter organization that is not in database', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email - should be in use
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Neat');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert step 2 header 
        cy.get('.auth-title.light').eq(1).contains('Create A User Profile');
    });

    it('Click next arrow - enter organization that is in database', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email - should be in use
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson');

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click();

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert step 2 header 
        cy.get('.auth-title.light').eq(1).contains('Create A User Profile');
    });

    it('Click next arrow - enter empty organization', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email - should be in use
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson');

        // Clear organization
        cy.get('.input.organization').children('input').clear();

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Invalid Organization');
    });

    it('Click next arrow - fill in all fields', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Assert step 2 header 
        cy.get('.auth-title.light').eq(1).contains('Create A User Profile');
    });

    it('Complete step 1 - leave step 2 empty', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button on step 1
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Wait for animation to complete
        cy.wait(1000);

        // Click next button on step 2
        cy.get('.content-box').children('.top').children('.buttons').children('button').eq(1).click({multiple: true});

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Only fill in username - not already in use', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button on step 1
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('.input.username').children('input').type('Cypress95');

        // Click next button on step 2
        cy.get('.content-box').children('.top').children('.buttons').children('button').eq(1).click({multiple: true});

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Please fill in all fields!');
    });

    it('Only fill in username and password - do not confirm password', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button on step 1
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('.input.username').children('input').type('Cypress95');

        // Fill in password
        cy.get('.input.password').children('input').type('password');

        // Click next button on step 2
        cy.get('.content-box').children('.top').children('.buttons').children('button').eq(1).click({multiple: true});

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Passwords do not match!');
    });

    it('Trigger password mismatch error', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button on step 1
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('.input.username').children('input').type('Cypress95');

        // Fill in password
        cy.get('.input.password').children('input').type('password');

        // Fill in confirm password
        cy.get('.input.password-verify').children('input').type('pass');

        // Click next button on step 2
        cy.get('.content-box').children('.top').children('.buttons').children('button').eq(1).click({multiple: true});

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('Passwords do not match!');
    });

    it('Trigger invalid username error', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button on step 1
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('.input.username').children('input').type('nvisal1');

        // Fill in password
        cy.get('.input.password').children('input').type('password');

        // Fill in confirm password
        cy.get('.input.password-verify').children('input').type('password');

        // Click next button on step 2
        cy.get('.content-box').children('.top').children('.buttons').children('button').eq(1).click({multiple: true});

        // Assert error message
        cy.get('.content-box').children('.top').children('.error').contains('This username is already taken');
    });

    it('Complete step 2', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button on step 1
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('.input.username').children('input').type('Cypress95');

        // Fill in password
        cy.get('.input.password').children('input').type('password');

        // Fill in confirm password
        cy.get('.input.password-verify').children('input').type('password');

        // Click next button on step 2
        cy.get('.content-box').children('.top').children('.buttons').children('button').eq(1).click({multiple: true});

        // Assert step 3 header
        cy.get('.auth-title.light').eq(1).contains('Preview your profile');
    });

    it('Assert information displayed in step 3', () => {
        // Navigate to registration form
        cy.contains('Register').click();

        // Fill in first name
        cy.get('.input.firstname').children('input').type('Nick');

        // Fill in last name
        cy.get('.input.lastname').children('input').type('test test');

        // Fill in email
        cy.get('.input.email').children('input').type('cypressTest@cypresstesting.com');

        // Fill in organization
        cy.get('.input.organization').children('input').type('Towson University');

        // Click next button on step 1
        cy.get('.content-box').children('.top').children('.buttons').children('button').click();

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('.input.username').children('input').type('Cypress95');

        // Fill in password
        cy.get('.input.password').children('input').type('password');

        // Fill in confirm password
        cy.get('.input.password-verify').children('input').type('password');

        // Click next button on step 2
        cy.get('.content-box').children('.top').children('.buttons').children('button').eq(1).click({multiple: true});

        // Assert step 3 usercard
        // Gravatar image
        cy.get('clark-user-card').children('.user-card.ng-star-inserted').children('.image');

        // User content 
        // Full name
        cy.get('clark-user-card').children('.user-card.ng-star-inserted').get('.user-content').children('.title').contains('Nick Test Test');
        // Username
        cy.get('clark-user-card').children('.user-card.ng-star-inserted').get('.user-content').children('.details').contains('Username: Cypress95');
        // Email
        cy.get('clark-user-card').children('.user-card.ng-star-inserted').get('.user-content').children('.details').contains('Email: cypressTest@cypresstesting.com');
        // Recaptcha
        cy.get('.recaptcha.ng-untouched.ng-pristine.ng-invalid');
    });
});