 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************

describe('Dashboard', () => {

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
    });   
    // =============================================================
    // /dashboard testing
    // =============================================================
    it('Navigate to dashboard', () => {
        // Login 
        cy.login();

        // Navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');
    });

    it('Navigate to dashboard and click new +', () => {
        // Login 
        cy.login();

        // Navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        //Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Assert URL
        cy.url().should('include', 'learning-object-builder');
    });

    it('Click checkboxes and look for delete button to appear', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click checkbox
        cy.get('#checkbox').click({ force: true });

        //Assert delete button has appeared
        cy.get('#delete-selected').click({ force: true });
    });

    it('Click object to edit it', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click object
        cy.get('#builder-link').click({ force: true });

        // Assert URL
        cy.url().should('include', 'learning-object-builder');
    });

    it('Navigate to dashboard and click existing object to edit it - through options', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click Edit from options dropdown
        cy.get('#options').click({ force: true });
        cy.get('.popup.small').eq(1).children('ul').children('li').first().click({ force: true });

         // Assert URL
         cy.url().should('include', 'learning-object-builder');
    });

    it('Navigate to dashboard and manage materials for an object', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click Edit from options dropdown
        cy.get('#options').click({ force: true });
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(1).click();

        // Assert URL
        cy.url().should('include', 'onion');
    });

    it('Navigate to dashboard and assert publish option', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click Edit from options dropdown
        cy.get('#options').click({ force: true });
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(2);
    });

    it('Navigate to dashboard and assert delete option', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click Edit from options dropdown
        cy.get('#options').click({ force: true });
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(3);
    });

    it('Save learning object', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Very long dashboard load time here
        cy.wait(1000);

        // Click object
        cy.get('#builder-link').click({ force: true });

        // Click Save button
        cy.get('#save-learning-object').click({ force: true });
    });

    it('Click next until returned to dashboard', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click object
        cy.get('#builder-link').click({ force: true });

        // Click Next button
        cy.get('#builder-next').click({ force: true });

        // Click Next button
        cy.get('#builder-next').click({ force: true });

        // Wait for page load so that button 
        // on previous page with same selector is not asserted
        cy.wait(1000);

        // Click save button at end of builder
        cy.get('#upload-save').click({ force: true });

        // Assert URL
        cy.url().should('include', 'dashboard');
    });
});