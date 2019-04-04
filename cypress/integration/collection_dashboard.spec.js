 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************

 describe('Collection Dashboard', () => {
     
    before(() => {

        // Return to home page before each test
        cy.visit('http://localhost:4200/home');

        // Wait for page to load
        cy.wait(1000);

         cy.curatorLogin();

        cy.wait(1000);

        cy.get('#gravatar').click({ force: true }, { multiple: true });
        cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

        cy.wait(1000);

        cy.get('#access-sidebar').children('ul').children('a').last().click({ force: true }, { multiple: true });

        cy.wait(300);

        cy.url().should('include', 'c5/reviewers');
    });

    it('Open add reviewer modal, click close', () => {
        cy.wait(1000);
        // click on add reviewers button to open modal
        cy.get('#add-reviewers').click({ force: true });
        cy.wait(1000);
        // click the add reviewers button again while the modal is opened to close it
        cy.get('#add-reviewers').click({ force: true });
    });

    it('Open remove reviewer modal, click cancel', () => {
        cy.wait(1000);
        // click on remove reviewer under a specified user card to open modal
        cy.get('.card__middle__objects').click({ force: true });
        cy.wait(1000);
        // click on cancel to close the modal while keeping the user as a reviewer
        cy.get('.center').children('button').last().click({ force: true });
    });

    it('Open remove reviewer modal, click confirm', () => {
        cy.wait(1000);
        // click on remove reviewer under a specified user card to open modal
        cy.get('.card__middle__objects').click({ force: true });
        cy.wait(1000);
        // click on yes inside the modal to successfully remove the user as a reviewer
        cy.get('.center').children('button').first().click({ force: true });
    });
 })