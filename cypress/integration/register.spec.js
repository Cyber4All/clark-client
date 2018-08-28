 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************

describe('Browse', () => {

    let regInfo; 

    beforeEach(() => {

        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
        cy.fixture('register.json').then((reg) => {
            regInfo = reg;
        });
    });   
    // =============================================================
    // /register testing
    // =============================================================
    it('Use Sign in link located in registration footer', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Click link
        cy.get('#bottom-register-link').click({ force: true });

        // Assert URL
        cy.url().should('include', '/auth/login');
    });

    it('Use Register link located in login footer', () => {
        // Navigate to registration form
        cy.get('#clark-sign-in').click({ force: true });

        // Click link
        cy.get('#bottom-login-link').click({ force: true });

        // Assert URL
        cy.url().should('include', '/auth/register');
    });

    it('Assert registration header', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Assert header
        cy.get('#registration-title');

        // Assert light header
        cy.get('#registration-light-header');

        // Assert step 1 header
        cy.get('#personal-header');
    });

    it('Click next arrow without filling in anything', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - only fill in first name', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - only fill in last name', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - only fill in email - one not in use already', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - only fill in organization', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in organization
        // This test enters an invalid input, do not replace with fixture
        cy.get('#organization').type('Towson', { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - only fill in first name and last name', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - only fill in first name, last name, and email', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - trigger invalid email error - already in use', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email - should be in use
        // invalid input, not a fixture
        cy.get('#input-email').type('nvisal1@students.towson.edu', { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - trigger invalid email error - invalid format', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email - should be in use
        cy.get('#input-email').type('nvisal1@students.towson.edu', { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - trigger organization results to block next button', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email 
        cy.get('#input-email').type('invalid format', { force: true});

        // Fill in organization
        cy.get('#organization').type('Towson', { force: true });

        // Wait for ui to appear
        cy.wait(1000);

        // Assert organization dropdown 
        cy.get('#container');
    });

    it('Click next arrow - enter organization that is not in database', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email - should be in use
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization, input is random word that does not return results, not fixture
        cy.get('#organization').type('Neat', { force: true });

        cy.wait(1000);

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert step 2 header 
        cy.get('#profile-title');
    });

    it('Click next arrow - enter organization that is in database', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type('towson', { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert step 2 header 
        cy.get('#profile-title');
    });

    it('Click next arrow - enter empty organization - enter org and delete it', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email - should be in use
        cy.get('#input-email').type('invalid format', { force: true });

        // Fill in organization
        cy.get('#organization').type('Towson', { force: true });

        // Clear organization
        cy.get('#organization').clear({ force: true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Click next arrow - fill in all fields', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force :true });

        // Click next button
        cy.get('#button-next').click({ force: true });

        // Assert step 2 header 
        cy.get('#profile-title');;
    });

    it('Complete step 1 - leave step 2 empty', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button on step 1
        cy.get('#button-next').click({ force: true });

        // Wait for animation to complete
        cy.wait(1000);

        // Click next button on step 2
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Only fill in username - not already in use', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button on step 1
        cy.get('#button-next').click({ force: true });

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('#input-username').type(regInfo[4], { force: true });

        // Click next button on step 2
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Only fill in username and password - do not confirm password', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button on step 1
        cy.get('#button-next').click({ force: true });

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('#input-username').type(regInfo[4], { force: true });

        // Fill in password
        cy.get('#input-password').type(regInfo[5], { force: true });

        // Click next button on step 2
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Trigger password mismatch error', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button on step 1
        cy.get('#button-next').click({ force: true });

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('#input-username').type(regInfo[4], { force: true });

        // Fill in password
        cy.get('#input-password').type(regInfo[5], { force: true });

        // Fill in confirm password
        cy.get('#input-verify-password').type('pass', { force: true });

        // Click next button on step 2
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Trigger invalid username error', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button on step 1
        cy.get('#button-next').click({ force: true });

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('#input-username').type('nvisal1', { force: true });

        // Fill in password
        cy.get('#input-password').type(regInfo[5], { force: true });

        // Fill in confirm password
        cy.get('#input-verify-password').type(regInfo[5], { force: true });

        // Click next button on step 2
        cy.get('#button-next').click({ force: true });

        // Assert error message
        cy.get('#error');
    });

    it('Complete step 2', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button on step 1
        cy.get('#button-next').click({ force: true });

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('#input-username').type(regInfo[4], { force: true });

        // Fill in password
        cy.get('#input-password').type(regInfo[5], { force: true });

        // Fill in confirm password
        cy.get('#input-verify-password').type(regInfo[5], { force: true });

        // Click next button on step 2
        cy.get('#button-next').click({ force: true });

        // Assert step 3 header
        cy.get('#preview-title');
    });

    it('Assert information displayed in step 3', () => {
        // Navigate to registration form
        cy.get('#clark-register').click({ force: true });

        // Fill in first name
        cy.get('#input-firstname').type(regInfo[0], { force: true });

        // Fill in last name
        cy.get('#input-lastname').type(regInfo[1], { force: true });

        // Fill in email
        cy.get('#input-email').type(regInfo[2], { force: true });

        // Fill in organization
        cy.get('#organization').type(regInfo[3], { force: true });

        // Select first organization from dropdown
        cy.get('#container').children('ul').children('li').first().click({ force: true });

        // Click next button on step 1
        cy.get('#button-next').click({ force: true });

        // Wait for animation to complete
        cy.wait(1000);

        // Fill in username
        cy.get('#input-username').type(regInfo[4], { force: true });

        // Fill in password
        cy.get('#input-password').type(regInfo[5], { force: true });

        // Fill in confirm password
        cy.get('#input-verify-password').type(regInfo[5], { force: true });

        // Click next button on step 2
        cy.get('#button-next').click({ force: true });

        // Assert step 3 usercard
        // Gravatar image
        cy.get('#card-image');

        // User content 
        // Full name
        cy.get('#card-title').contains(regInfo[0]);
        // Username
        cy.get('#card-username').contains('Username: ' + regInfo[4]);
        // Email
        cy.get('#card-email').contains('Email: ' + regInfo[2]);
        // Recaptcha
        cy.get('#recaptcha');
    });
});