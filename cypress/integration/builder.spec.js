 /// <reference types="cypress" />

 import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
 
 describe('Browse', () => {
 
     beforeEach(() => {
         // Return to home page before each test
         cy.visit('http://localhost:4201/home');
     });   
     // =============================================================
     // /learning-object-builder testing
     // =============================================================
     it('Assert element within Basic Information step of builder', () => {
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        // Login 
        cy.login();

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
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click on options 
        cy.get('.rows').eq(1).children('.row.unpublished').children('.options').click();
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(3).click();
        cy.get('.popup-wrapper').children('.popup.dialog.title-bad').children('.btn-group.center').children('div').eq(0).click({force: true});
    });

    it('Assert author dropdown', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Enter user query
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(1).children('input').type('N');
        
        // Assert user results 
        cy.get('#container').children('ul').children('li').first().contains('dreeves132');
    });

    it('Assert level options', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Select first level
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(3).children('.level-list').children('.level.button').eq(1).click();
        
         // Select second level
         cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(3).children('.level-list').children('.level.button').eq(1).click();
        
        // Select third level
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(3).children('.level-list').children('.level.button').eq(2).click();

        // Select fourth level
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(3).children('.level-list').children('.level.button').eq(3).click();

        // Select fifth level
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(3).children('.level-list').children('.level.button').eq(4).click();

        // Select sixth level
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(3).children('.level-list').children('.level.button').eq(5).click();
    });

    it('Assert items on the sidebar', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Assert sidebar
        // Assert title
        cy.get('.content-wrapper').children('.sidebar-wrapper').children('onion-sidebar')
            .children('.sidebar-wrapper').children('.title').contains('Learning Object');

        // Assert menu item 1
        cy.get('.content-wrapper').children('.sidebar-wrapper').children('onion-sidebar')
            .children('.sidebar-wrapper').children('.menu-item').eq(0).children('.menu-item-inner').contains('1. Basic Information');
        
        // Assert menu item 2
        cy.get('.content-wrapper').children('.sidebar-wrapper').children('onion-sidebar')
            .children('.sidebar-wrapper').children('.menu-item').eq(1).children('.menu-item-inner').contains('2. Learning Outcomes');

        // Assert menu item 3 (link to add new learning outcome)
        cy.get('.content-wrapper').children('.sidebar-wrapper').children('onion-sidebar')
            .children('.sidebar-wrapper').children('.menu-item-group.open').children('.menu-item.externalAction')
            .children('.menu-item-inner').contains('New Learning Outcome');

        // Assert menu item 4
        cy.get('.content-wrapper').children('.sidebar-wrapper').children('onion-sidebar')
            .children('.sidebar-wrapper').children('div').eq(4).children('.menu-item').contains('3. Upload Materials');
    });

    it('Add a new learning outcome and assert elements of the form', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Click link to add new learning outcome
        cy.get('.content-wrapper').children('.sidebar-wrapper').children('onion-sidebar')
            .children('.sidebar-wrapper').children('.menu-item-group.open').children('.menu-item.externalAction')
            .children('.menu-item-inner').contains('New Learning Outcome').click();

        // Assert for header 
        cy.get('.outcome-container-wrapper').children('.section').children('.title.sticky').contains('Learning Outcome');
        
        // Click Remember and Understand 
        cy.get('.container').children('.container-flexer').children('onion-blooms-selector').children('.outcome_bloom')
            .children('.squares').children('.square').eq(0).click();

        // Click Apply and Analyze
        cy.get('.container').children('.container-flexer').children('onion-blooms-selector').children('.outcome_bloom')
            .children('.squares').children('.square').eq(1).click();

        // Click Evaluate and Synthesize
        cy.get('.container').children('.container-flexer').children('onion-blooms-selector').children('.outcome_bloom')
            .children('.squares').children('.square').eq(2).click();
        
        // Click Mapped Outcomes 
        cy.get('.mappings-toolbar').children('.tab').eq(0).click();

        // Click Search curricular guidelines for outcomes
        cy.get('.mappings-toolbar').children('.tab').eq(1).click();

        // Click Suggested mappings
        cy.get('.mappings-toolbar').children('.tab').eq(2).click();
    });

    it('Trigger outcome text error' , () => {
        // Login 
        cy.login();

        // Navigate to Your Dashboard
        cy.contains('Contribute to CLARK').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('.top').children('.actions.btn-group.to-right').children('.add.button.good').click();

        // Enter Learning Object name
        cy.get('.content-wrapper').children('.component-wrapper').children('.inner')
            .children('onion-learning-object-info-page').children('onion-learning-object-metadata')
            .children('.metadata-wrapper').children('.section').children('.input-group').eq(0).children('input').type('blah blah cypress testing');

        // Wait 
        cy.wait(1000);

        // click link to add new learning outcome
        cy.get('.content-wrapper').children('.sidebar-wrapper').children('onion-sidebar')
            .children('.sidebar-wrapper').children('.menu-item-group.open').children('.menu-item.externalAction')
            .children('.menu-item-inner').contains('New Learning Outcome').click();

        // Click Next button
        cy.get('.next.button.neutral.on-white').click();

        // Assert error 
        cy.get('notification').children('.notification.bad').children('.note-content').children('.title').contains('Error!');
        cy.get('notification').children('.notification.bad').children('.note-content').children('.text').contains('You cannot submit a learning outcome without outcome text!');
    });
 });