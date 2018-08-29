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

        // navigate to Your Dashboard - using navbar link
        cy.get('#contributor-link').click({ force: true });
        cy.contains('Your dashboard').click({ force: true });

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

        // Click New Learning Outcome
        cy.get('#child-link').click({ force: true });
        
        // Enter Outcome Name
        cy.get('#outcome-text').type(objects[2], { force: true });

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
        cy.get('#context-popup').children('ul').children('li').eq(3).click({ force: true });
        cy.get('#popup-dialog').children('#dialog-button').children('div').eq(0).click({force: true});
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
        cy.get('#level-selection').click({ force: true });
        
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
        cy.get('#square').click({ force: true });
        
        // Click Mapped Outcomes 
        cy.get('#mappings').click({ force: true });

        // Click Search curricular guidelines for outcomes
        cy.get('#search').click({ force: true });

        // Click Suggested mappings
        cy.get('#suggestions').click({ force: true });
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

    it('Assert description to publish error' , () => {
        // Login 
        cy.login();

        // Navigate to Your Dashboard
        cy.get('#contribute-to-clark').click({ force: true });

        // Wait for page load
        cy.wait(1000);

        // Click first object in your Dashboard
        cy.get('#builder-link').click({ force: true });

        // Wait 
        cy.wait(1000);

        cy.get('#object-name-field').type(objects[3], { force: true });

        // Assert Unpublised label
        cy.get('#toggle-label').contains('unpublished');

        // Click slider to change published status
        cy.get('#toggle-switch').click({ force: true });

        // Assert Published label
        cy.get('#toggle-label').contains('published');

        // Enter description
        cy.get('iframe').eq(1).type('blah', { force: true });

        // Click next button
        cy.get('#builder-next').click({ force: true });

        // Create learning outcome
        // Click link to add new learning outcome
        cy.get('#child-link').click({ force: true });

        // Enter Outcome Name
        cy.get('#outcome-text').type(objects[2], { force: true });

        // Click next button
        cy.get('#builder-next').click({ force: true });

        // Assert error 
        cy.get('#note-content');
    });

    it('Navigate directly to the builder from navbar', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard - using navbar link
        cy.get('#contributor-link').click({ force: true });
        cy.contains('Create a Learning Object').click({ force: true });

        // Assert URL 
        cy.url().should('include', '/onion/learning-object-builder');
    });

    it('Save a learning object', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard - using navbar link
        cy.get('#contributor-link').click({ force: true });
        cy.contains('Create a Learning Object').click({ force: true });

        // Assert URL 
        cy.url().should('include', '/onion/learning-object-builder');

        // Enter learning object name 
        cy.get('#object-name-field').type(objects[4], { force: true });

        // Click Save Learning Object button
        cy.get('#save-learning-object').click({ force: true });

        // Click Save for Later
        // cy.get('#save-for-later').click({ force: true });
        cy.get('#popup-dialog').children('#dialog-button').children('div').eq(1).click({force: true});

        // Assert Unpublished label 
        cy.get('#toggle-label').contains('unpublished');

        // Go to dashboard and assert new, unpublished object
        cy.get('#back-to-dashboard').click({ force: true });

        // Assert URL
        cy.url().should('include', '/onion/dashboard');

        cy.contains(objects[1], { force: true });

        // Delete new object
        cy.get('#options').click({ force: true });
        cy.get('#context-popup').children('ul').children('li').eq(3).click({ force: true });
        cy.get('#popup-dialog').children('#dialog-button').children('div').eq(0).click({force: true});
    });

    it('Click dropzone for file upload', () => {
        // Login 
        cy.login();

        // navigate to Your Dashboard - using navbar link
        cy.get('#contributor-link').click({ force: true });
        cy.contains('Create a Learning Object').click({ force: true });

        // Assert URL 
        cy.url().should('include', '/onion/learning-object-builder');

        // Enter learning object name 
        cy.get('#object-name-field').type(objects[6], { force: true });

        // Click next button
        cy.get('#builder-next').click({ force: true });

        // Create learning outcome
        // Click link to add new learning outcome
        cy.get('#child-link').click({ force: true });

        // Enter Outcome Name
        cy.get('#outcome-text').type(objects[6], { force: true });

        // Click next button
        cy.get('#builder-next').click({ force: true });

        // Assert URL
        cy.get('#new-file').click({ force: true });
    });

    it('Delete all objects', () => {
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
        cy.get('#popup-dialog').children('#dialog-button').children('div').eq(0).click({force: true});
    });
 });