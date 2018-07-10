 /// <reference types="cypress" />

 import Chance from 'chance';
 import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
 const chance = new Chance();
 
 describe('Browse', () => {
     const email = chance.email();
 
     beforeEach(() => {
         // Return to home page before each test
         cy.visit('http://localhost:4201/home');
     });   
     // =============================================================
     // /learning-object-builder testing
     // =============================================================
     it('Assert element within Basic Information step of builder', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        //Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Assert URL
        cy.url().should('include', 'learning-object-builder');

        // Assert title
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.header').children('.title').contains('Basic Information');
        
        // Assert Learning Object name label
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(0).children('.label').contains('What is this learning object named?');

        // Assert contributors label
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(1).children('.label').contains('Add more authors.');

        // Assert length label
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(2).children('.label').contains('What is the Length of this learning object?');
        
        // Assert levels label
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(3).children('.label').contains('What levels is this content suited for?');
        
        // Assert decription label
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-description')
            .children('.description-wrapper').children('.input-group').children('.label').contains('How would you describe this learning object?');
    });

    it('Trigger please enter a name for this learning object error', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        //Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Click Next button without filling out step 1 form
        cy.get('.next.button.neutral.on-white').click();

        // Click Next button without filling out step 2 form 
        cy.get('.next.button.neutral.on-white').click();

        // Assert error message 
        cy.get('notification').children('.notification.bad').children('.note-content').children('.title').contains('Error!');
        cy.get('notification').children('.notification.bad').children('.note-content').children('.text').contains('Please enter a name for this learning object!');
    });

    it('Trigger name already exists error', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        //Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();
        
        // Enter Learning Object name
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
        .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
        .children('.metadata-wrapper').children('.section').children('.input-group').eq(0).children('input').type('test');

        // Click Next button without filling out step 1 form
        cy.get('.next.button.neutral.on-white').click();

        // Click Next button without filling out step 2 form 
        cy.get('.next.button.neutral.on-white').click();

        // Assert error message 
        cy.get('notification').children('.notification.bad').children('.note-content').children('.title').contains('Error!');
        cy.get('notification').children('.notification.bad').children('.note-content').children('.text').contains('Could not save Learning Object. Learning Object with name: test already exists.');
    });

    it('Successfully navigate to the manage materials page (step 3)', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        //Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();
        
        // Enter Learning Object name
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(0).children('input').type('Learn how to use Cypress');

        // Click Next 
        cy.get('.next.button.neutral.on-white').click();

        // Click Next button 
        cy.get('.next.button.neutral.on-white').click();

        // Assert page 3 header 
        cy.get('.content-upload-component').children('.container').children('.inner-wrapper.padded-bottom')
            .children('.header').children('.title').contains('Manage Materials');
    });

    it('Delete created Learning Object', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click on options 
        cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(3).click();
        cy.get('.popup-wrapper').children('.popup.dialog.title-bad').children('.btn-group.center').children('div').eq(0).click({force: true});
    });
 });