 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************

describe('Details', () => {

    let creds; 

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
        cy.fixture('creds.json').then((cred) => {
            creds = cred;
        });
    });   
    // =============================================================
    // /details testing
    // =============================================================
    it('Navigate to details and click on author name to view author profile', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Click author name
        cy.get('#author-link').first().click({ force: true }, { multiple: true }); 

        // Assert URL 
        cy.url().should('include', 'user');
    });

    it('Navigate to details and click on login button', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Click author name
        cy.get('#login-msg').children('a').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info
        // Different steps for login - don't replace with helper method
        cy.get('input[name=username]').type(creds[0], { force: true });
        cy.get('input[name=password]').type(creds[1], { force: true });
        cy.get('.auth-button').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'home');
    });

     it('Navigate to details and clicking the rating to scroll page', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ force: true }, { multiple: true });

        // TODO all login code can be removed when pulling ratings from server
        // Click author name
        cy.get('.topbar .login').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'login');

        cy.wait(1000);

        // Enter login info
        // Different steps for login - don't replace with helper method
        cy.get('input[name=username]').type('nwinne1');
        cy.get('input[name=password]').type('testpassword');
        cy.get('.auth-button').click({ force: true });

        cy.wait(1000);

        cy.url().should('include', 'details');

        cy.get('.rating > clark-rating-stars').first().click({ force: true }, { multiple: true });

        cy.window().then(($w) => {
            cy.get('.ratings').invoke('offset').its('top').should(($p) => {
                expect($p - $w.scrollY).to.be.at.most(200)
            });      
        })
     });

     it('Navigate to details and clicking on \'Write a review\'', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // ensure that when not logged in, option doesn't exist
        cy.get('.rating > a').should('not.exist');

        // login
        cy.login();

        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ force: true }, { multiple: true });

        cy.get('.rating > a').first().click({ force: true }, {  multiple: true });

        cy.get('.new-rating-wrapper').should('be.visible').should('have.class', 'active');
        cy.get('.new-rating').should('be.visible');
     });

    //  it('From details page, click \'report\' on a rating', () => {
    //     // Wait for learning objects to load on page
    //     cy.visit('http://localhost:4200/details/dark/Cybersecurity%20and%20Society');

    //     cy.wait(1000);

    //     cy.visit('.rating-list-element .options').first().click({multiple: true})
    //  })

    // it('Navigate to details and click DOWNLOAD NOW button when logged out', () => {
    //     // Wait for learning objects to load on page
    //     cy.wait(1000);
    it('Navigate to details and click DOWNLOAD NOW button when logged out', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Click DOWNLOAD NOW button 
        // if disabled class is present, it is working correctly.
        cy.wait(1000);
        cy.get('#download-button').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'details');
    });

    it('Navigate to details and click DOWNLOAD NOW button', () => {
        // Login 
        cy.login();

        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Assert Details page URL 
        cy.url().should('include', 'details');

        // Click DOWNLOAD NOW button 
        // if disabled class is present, it is working correctly.
        cy.wait(1000);
        cy.get('#download-button').click({ force: true });
    });

    it('Navigate to details and click SAVE TO LIBRARY button', () => {
        // Login 
        cy.login();

        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Assert Details page URL 
        cy.url().should('include', 'details');

        // Click DOWNLOAD NOW button 
        // if disabled class is present, it is working correctly.
        cy.wait(1000);
        cy.get('#save-to-library').click({ force: true });

        // Navigate to library and assert object 
        cy.get('#library-link').click({ force: true });

        cy.url().should('include', '/library');

        cy.get('#library-count').contains('1');

        // Remove item from library 
        cy.get('#remove-library-item').click({ force: true });

        cy.get('#library-count').contains('1');
    });

    it('Navigate to details and click all of the share buttons', () => {
        // Login 
        cy.login();

        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Assert Details page URL 
        cy.url().should('include', 'details');

        // Click DOWNLOAD NOW button 
        // if disabled class is present, it is working correctly.
        cy.wait(1000);
        cy.get('#facebook').click({ force: true });
        cy.get('#twitter').click({ force: true });
        cy.get('#linkedin').click({ force: true });
        cy.get('#email');
        cy.get('#copylink').click({ force: true });
    });
}); 
