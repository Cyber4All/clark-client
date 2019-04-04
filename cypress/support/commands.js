// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Login help method 
Cypress.Commands.add('login', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true });

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('testaccount');
    cy.get('input[name=password]').type('password12345!');
    cy.get('#auth-button').click();

    cy.wait(1000);

    cy.url().should('include', 'home');
});

// Login help method (verified email)
Cypress.Commands.add('verifiedLogin', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true })

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('emailtestaccount');
    cy.get('input[name=password]').type('password');
    cy.get('#auth-button').click();

    cy.wait(1000);

    cy.url().should('include', 'home');
});

Cypress.Commands.add('curatorLogin', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true })

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('testcurator');
    cy.get('input[name=password]').type('password');
    cy.get('#auth-button').click();

    cy.wait(1000);

    cy.url().should('include', 'home');
})

Cypress.Commands.add('editorLogin', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true })

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('testeditor');
    cy.get('input[name=password]').type('password');
    cy.get('#auth-button').click();

    cy.wait(1000);

    cy.url().should('include', 'home');
})

Cypress.Commands.add('adminLogin', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true })

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('testadmin');
    cy.get('input[name=password]').type('password');
    cy.get('#auth-button').click();

    cy.wait(1000);

    cy.url().should('include', 'home');
})

Cypress.Commands.add('reviewerLogin', () => {
    // Click sign in button 
    cy.get('#clark-sign-in').click({ force: true })

    // Assert URL 
    cy.url().should('include', 'login');

    // Enter login info 
    cy.get('input[name=username]').type('testreviewer');
    cy.get('input[name=password]').type('password');
    cy.get('#auth-button').click();

    cy.wait(1000);

    cy.url().should('include', 'home');
})

/**
 * Opens the object 'Test Object' in the builder
 * if no id is passed, requires cypress to already be on the dashboard
 */
Cypress.Commands.add('editTestObject', (id = '') => {
    if (id) {
        cy.visit('/onion/learning-object-builder/' + id);
    } else {
        cy.fixture('objects.json').then((objects) => {
            const object = objects[objects.length - 1];

            cy.get('div.row-item').contains(object).siblings(':last-child').within((_) => {
                // click the meatball for any row containing the string of the object variable
                cy.get('.meatball').click({ force: true });
            });

            // click the context menu option containing the string 'Edit'
            cy.get('.context-menu ul li:first-child').contains('Edit').click({ force: true });

        })
    }
});

/**
 * Deletes the object 'Test Object'
 * Requires cypress to already be on the dashboard
 */
Cypress.Commands.add('deleteTestObject', () => {
    cy.fixture('objects.json').then((objects) => {
        const object = objects[objects.length - 1];

        cy.get('div.row-item').contains(object).siblings(':last-child').within((_) => {
            // click the meatball for any row containing the string of the object variable
            cy.get('.meatball').click({ force: true });
        });

        // click the context menu option containing the string 'Delete'
        cy.get('.context-menu ul li:last-child').contains('Delete').click({ force: true });

        // click the confirmation button
        cy.get('clark-popup-viewer').contains('do it').click({force: true});
    })
});

/**
 * Navigate around the builder using the main menu
 * Requires cypress to already be  at the learning object builder and the passed navigation link to be enabled
 * @param {string} menuText the text contained inside the navigation link 
 */
Cypress.Commands.add('navigateBuilder', (menuText) => {
    cy.get('.builder-navbar-wrapper__bottom-left-menu li a').contains(menuText).click({ force: true });
});

// Method that prevents uncaught exceptions from failing otherwise working tests
// This is referenced in the learning object builder testing
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})
