 /// <reference types="cypress" />

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
        cy.get('.learning-object').first().click({ multiple: true });

        // Click author name
        cy.get('.author').children('.link').first().click({ multiple: true });

        // Click organization link 
        cy.get('.organization').children('a').click();

        // Assert URL 
        cy.url().should('include', 'organization');
    });

    it('Navigate to personal profile page', () => {
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        cy.get('input[name=firstname]').type(names[2]);

        // Click Save
        cy.get('.button.good').click();

        // Check for new name
        cy.contains('Random');

         // Click Edit Profile
         cy.get('.edit').children('span').first().click();

         // Fill out name input 
         cy.get('input[name=firstname]').clear();
         cy.get('input[name=firstname]').type(names[1]);
 
         // Click Save
         cy.get('.button.good').click();
 
         // Check for new name
         cy.contains('Nick');
    });

    it('Navigate to personal profile page and enter correct password to see if inputs appear', () => {
        // Login 
        cy.login();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Fill out name input 
        cy.get('input[name=password]').type(creds[1]);
    
        // Check for new fields 
        cy.get('input[name="new password"]');
    });
});