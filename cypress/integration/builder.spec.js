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
        cy.get('#contribute-to-clark').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click();

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
        cy.get('#contribute-to-clark').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click();

        // Click Next button without filling out step 1 form
        cy.get('#builder-next').click();

        // Click Next button without filling out step 2 form 
        cy.get('#builder-next').click();

        // Assert error message 
        cy.get('#note-content');
    });

    it('Trigger name already exists error', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click();
        
        // Enter Learning Object name
        cy.get('#object-name-field').type(objects[0], );

        // Click Next button without filling out step 1 form
        cy.get('#builder-next').click();

        // Click Next button without filling out step 2 form 
        cy.get('#builder-next').click();

        // Click Next button without filling out step 2 form 
        cy.get('#builder-next').click();

        // Assert error message 
        cy.get('#note-content');
    });

    it('Successfully navigate to the manage materials page (step 3)', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click New +
        cy.get('#create-new-learning-object').click();
        
        // Enter Learning Object name
        cy.get('#object-name-field').type(objects[1], );

        // Click Next 
        cy.get('#builder-next').click();

        // Click New Learning Outcome
        cy.get('#child-link').click();
        
        // Enter Outcome Name
        cy.get('#outcome-text').type(objects[2], );

        // Click Next button 
        cy.get('#builder-next').click();

        // Assert page 3 header 
        cy.get('#materials-title');
    });

    it('Delete created Learning Object', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');

        // Click on options 
        cy.get('#options').click();
        cy.get('.popup.small').eq(1).children('ul').children('li').eq(3).click();
        cy.get('.popup-wrapper').children('.popup.dialog.title-bad').children('.btn-group.center').children('div').eq(0).click({force: true});
    });

    it('Assert author dropdown', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click();

        // Enter user query
        cy.get('#user-search').type('N', );
        
        // Assert user results 
        cy.get('#container').children('ul').children('li').first();
    });

    it('Assert level options', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click();

        // Select first level
        cy.get('#level-selection').click();
        
    });

    it('Assert items on the sidebar', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click();

        // Assert sidebar
        // Assert title
        cy.get('#sidebar-title');

        // Assert menu item 1
        cy.get('#sidebar-item-link');

        // Assert menu item 3 (link to add new learning outcome)
        cy.get('#child-link');

        // Assert menu item 4
        cy.get('#upload-material-link');
    });

    it('Add a new learning outcome and assert elements of the form', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click();

        // Click link to add new learning outcome
        cy.get('#child-link').click();

        // Assert for header 
        cy.get('#outcome-title');
        
        // Click Remember and Understand 
        cy.get('#square').click();
        
        // Click Mapped Outcomes 
        cy.get('#mappings').click();

        // Click Search curricular guidelines for outcomes
        cy.get('#search').click();

        // Click Suggested mappings
        cy.get('#suggestions').click();
    });

    it('Trigger outcome text error' , () => {
        // Login 
        cy.login();

        // Navigate to Your Dashboard
        cy.get('#contribute-to-clark').click();

        // Wait for page load
        cy.wait(1000);

        // Click New +
        cy.get('#create-new-learning-object').click();

        // Enter Learning Object name
        cy.get('#object-name-field').type(objects[2], );

        // Wait 
        cy.wait(1000);

        // click link to add new learning outcome
        cy.get('#child-link').click();

        // Click Next button
        cy.get('#builder-next').click();

        // Assert error 
        cy.get('#note-content');
    });
 });