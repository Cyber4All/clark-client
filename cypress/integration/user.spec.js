 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************

describe('User', () => {

    let names;
    let creds;

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
        cy.fixture('names.json').then((name) => {
            names = name;
        });
        cy.fixture('creds.json').then((cred) => {
            creds = cred;
        });
    });   
    // =============================================================
    // /user testing
    // =============================================================
    it('Navigate to organization members page', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click author name
        cy.get('#author-link').click({ force: true }, { multiple: true });

        // Click organization link 
        cy.get('#organization-link').children('a').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'organization');
    });

    it('Navigate to organization members page through navbar', () => {
        cy.login();

        // Wait for learning objects to load on page
        cy.wait(1000);

        // Navigate to user profile from navbar
        cy.get('#gravatar').click({ force: true }, { multiple: true });
        cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

        // Click organization link 
        cy.get('#organization-link').children('a').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'organization');
    });

    it('Navigate to personal profile page', () => {
        // Login 
        cy.login();

        // Wait for sign in process
        cy.wait(1000);

        // Assert new navbar elements
        cy.get('#contributor-link');
        cy.get('#gravatar').click({ force: true });
        cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');
    });

    it('Navigate to personal profile page and click edit profile', () => {
        // Login 
        cy.login();

        // Assert new navbar elements
        cy.get('#contributor-link');
        cy.get('#gravatar').click({ force: true });
        cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('#edit-profile').click({ force: true });

        // Check for new page content 
        cy.get('#edit-profile-title');
    });

    it('Navigate to personal profile page and click edit profile and click DISCARD CHANGES', () => {
        // Login 
        cy.login();

        // Assert new navbar elements
        cy.get('#contributor-link');
        cy.get('#gravatar').click({ force: true });
        cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('#edit-profile').click({ force: true });

        // Click Discard Changes
        cy.get('#discard-changes').click({ force: true });

        // Check for new page content
        cy.get('#profile-title');
    });

    it('Navigate to personal profile page and click edit profile and click SAVE', () => {
        // Login 
        cy.login();

        // Assert new navbar elements
        cy.get('#contributor-link');
        cy.get('#gravatar').click({ force: true });
        cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('#edit-profile').click({ force: true });

        // Fill out name input 
        cy.get('input[name=firstname]').clear({ force: true });
        cy.get('input[name=firstname]').type(names[2], { force: true });

        // Click Save
        cy.get('#save-changes').click({ force: true });

        // Check for new name
        cy.contains('Random');

        // Click Edit Profile
        cy.get('#edit-profile').click({ force: true });

        // Fill out name input 
        cy.get('input[name=firstname]').clear({ force: true });
        cy.get('input[name=firstname]').type(names[1], { force: true });
 
        // Click Save
        cy.get('#save-changes').click({ force: true });
 
        // Check for new name
        cy.contains('Nick');
    });

    // it('Navigate to personal profile page and enter correct password to see if inputs appear', () => {
    //     // Login 
    //     cy.login();

    //     // Assert new navbar elements
    //     cy.get('#contributor-link');
    //     cy.get('#gravatar').click({ force: true });
    //     cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ force: true }, { multiple: true });

    //     // Assert URL 
    //     cy.url().should('include', 'user');

    //     // Click Edit Profile
    //     cy.get('#edit-profile').click({ force: true });

    //     // Fill out name input 
    //     cy.get('input[name=password]').type(creds[1], { force: true });
    
    //     // Check for new fields 
    //     cy.get('input[name="new password"]');
    // });

    it('Navigate to personal profile page and click print clark card button', () => {
        // Login 
        cy.login();

       // Navigate to user profile from navbar
       cy.get('#gravatar').click({ force: true }, { multiple: true });
       cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

       // Click organization link 
       cy.get('#clark-card-link').click({ force: true });
    });

    it('Click on create a learning object button', () => {
        // Login 
        cy.login();

       // Navigate to user profile from navbar
       cy.get('#gravatar').click({ force: true }, { multiple: true });
       cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

       // Click organization link 
       cy.get('#profile-create-learning-object').click({ force: true });

        // Assert URL 
        cy.url().should('include', '/onion/dashboard');
    });
});