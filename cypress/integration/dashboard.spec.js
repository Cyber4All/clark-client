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
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');
    });

    it('Navigate to dashboard and click new +', () => {
        // Login 
        cy.login();

        // Navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        //Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Assert URL
        cy.url().should('include', 'learning-object-builder');
    });

    it('Click checkboxes and look for delete button to appear', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click checkbox
        cy.get('.rows').eq(1).children('.row.unpublished').children('clark-checkbox').children('.checkbox').click();

         //Assert delete button has appeared
         cy.get('.top').children('.actions.btn-group.to-right').children('.filter.bad.button');
  
    });

    it('Click object to edit it', () => {
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

         // Click Edit from options dropdown
         cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
         cy.get('.popup.small').eq(1).children('ul').children('li').eq(2);
    });

    it('Navigate to dashboard and assert delete option', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click Edit from options dropdown
        cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(3);
    });

    it('Save learning object', () => {
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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