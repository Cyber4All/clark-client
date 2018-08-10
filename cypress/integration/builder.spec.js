 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************
 
 describe('Browse', () => {

    let objects
 
     beforeEach(() => {
         // Return to home page before each test
         cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
        cy.fixture('objects.json').then((object) => {
            objects = object;
        });
     });   
     // =============================================================
     // /learning-object-builder testing
     // =============================================================
     it('Assert element within Basic Information step of builder', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Assert URL
        cy.url().should('include', 'learning-object-builder');

        // Assert title
        cy.get('#basic-information-title');
        
        // Assert Learning Object name label
        cy.get('#name-label');

        // Assert contributors label
        cy.get('#contributors-label');

        // Assert length label
        cy.get('#length-label');
        
        // Assert levels label
        cy.get('#level-label');
        
        // Assert decription label
        cy.get('#description-label');
    });

    it('Trigger please enter a name for this learning object error', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Click Next button without filling out step 1 form
        cy.get('#builder-next').click({ force: true });

        // Click Next button without filling out step 2 form 
        cy.get('#builder-next').click({ force: true });

        // Assert error message 
        cy.get('#note-content');
    });

    it('Trigger name already exists error', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });
        
        // Enter Learning Object name
        cy.get('#object-name-field').type(objects[0], { force: true });

        // Click Next button without filling out step 1 form
        cy.get('#builder-next').click({ force: true });

        // Click Next button without filling out step 2 form 
        cy.get('#builder-next').click({ force: true });

        // Click Next button without filling out step 2 form 
        cy.get('#builder-next').click({ force: true });

        // Assert error message 
        cy.get('#note-content');
    });

    it('Successfully navigate to the manage materials page (step 3)', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });
        
        // Enter Learning Object name
        cy.get('#object-name-field').type(objects[1], { force: true });

        // Click Next 
        cy.get('#builder-next').click({ force: true });

        // Click Next button 
        cy.get('#builder-next').click({ force: true });

        // Assert page 3 header 
        cy.get('#materials-title');
    });

    it('Delete created Learning Object', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click on options 
        cy.get('#options').click({ force: true });
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(3).click({ force: true });
        cy.get('.popup-wrapper').children('.popup.dialog.title-bad').children('.btn-group.center').children('div').eq(0).click({force: true});
    });

    it('Assert author dropdown', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Enter user query
        cy.get('#user-search').type('N', { force: true });
        
        // Assert user results 
        cy.get('#container').children('ul').children('li').first();
    });

    it('Assert level options', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Select first level
        cy.get('#level-selection').eq(0).click({ force: true });
        
        // Select second level
        cy.get('#level-selection').eq(1).click({ force: true });
        
        // Select third level
        cy.get('#level-selection').eq(2).click({ force: true });

        // Select fourth level
        cy.get('#level-selection').eq(3).click({ force: true });

        // Select fifth level
        cy.get('#level-selection').eq(4).click({ force: true });

        // Select sixth level
        cy.get('#level-selection').eq(5).click({ force: true });
    });

    it('Assert items on the sidebar', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Assert sidebar
        // Assert title
        cy.get('#sidebar-title');

        // Assert menu item 1
        cy.get('#sidebar-item-link').eq(0);
        
        // Assert menu item 2
        cy.get('#sidebar-item-link').eq(1);

        // Assert menu item 3 (link to add new learning outcome)
        cy.get('#child-link');

        // Assert menu item 4
        cy.get('#upload-material-link');
    });

    it('Add a new learning outcome and assert elements of the form', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Click link to add new learning outcome
        cy.get('#child-link').click({ force: true });

        // Assert for header 
        cy.get('#outcome-title');
        
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
        cy.get('#contribute-to-clark').click({ force: true });

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click({ force: true });

        // Enter Learning Object name
        cy.get('#object-name-field').type(objects[2], { force: true });

        // Wait 
        cy.wait(1000);

        // click link to add new learning outcome
        cy.get('#child-link').click({ force: true });

        // Click Next button
        cy.get('#builder-next').click({ force: true });

        // Assert error 
        cy.get('#note-content');
    });
 });