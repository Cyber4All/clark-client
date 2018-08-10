/// <reference types="cypress" />
// *********************************************************************
// Important note about the use of selectors when writing Cypress tests:
//     Do not select elements by class name as they are highly volatile.
//     Instead, refence all selections by id.
// *********************************************************************

describe('Home', () => {

    let creds;
    let names;

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });
        cy.fixture('creds.json').then((cred) => {
            creds = cred;
        });
        cy.fixture('names.json').then((name) => {
            names = name;
        });
    });

    // /home tests
    // =============================================================
    it('Has page title', () => {
        cy.get('#home-title');
    });

    it('Navbar renders correctly', () => {
        cy.get('#clark-logo');
        cy.get('#clark-sign-in');
        cy.get('#clark-register');
    });

    it('Sign in', () => {
        // Login 
        cy.login();

        // Assert new navbar elements
        cy.get('#contributor-link');
        cy.get('#gravatar').click();
    });

    it('Assert registration', () => {
        cy.get('#clark-register').click();

        // Assert URL 
        cy.url().should('include', 'register');
    });

    it('Navigate to browse', () => {
        cy.get('#view-all').click();

        // Assert URL 
        cy.url().should('include', 'browse');
    });

    it('Navigate to details', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'details');
    });

    it('Clicking display search without entering text does not search', () => {
        cy.get('#search-button').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking navbar search without entering text does not search', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click();
        
        // Click search key
        cy.get('#clark-search-input').type('{enter}', );

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking display search after typing in it', () => {
        // Type in to search bar
        cy.get('#search-input').type(names[1], );

        // Click search 
        cy.get('#search-button').click();

        // Assert URL 
        cy.url().should('include', 'text');
    });

    it('Clicking navbar search after typing in it - Keyword search', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click();
        
        // Type search query
        cy.get('#clark-search-input').type(names[0], );
        
        // Click search icon
        cy.get('#clark-search-input').type('{enter}', );

        // Assert URL 
        cy.url().should('include', 'browse');
    });

    it('Click on contribute button (bottom of home page) while logged out.', () => {
        cy.get('#contribute-to-clark').click();
        // Assert URL 
        cy.url().should('include', 'login');
    });

    it('Clicking navbar and switching to outcome search should display new menu items', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click();
        
        // Click outcomes search selector
        cy.get('#outcomes-option').click();

        // Assert new menu icons
        cy.get('#search-sources');
    });

    it('Assert search dropdown description', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click();
        
        // Type search query
        cy.get('#search-description');
    });

    it('Assert search dropdown exit', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click();
        
        // Click exit
        cy.get('#search-close').click();
    });

    it('Click on contribute button while logged in.', () => {
        // Login 
        cy.login();

        // Click contribute button at bottom of page
        cy.get('#contribute-to-clark').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');
    });

    it('Navigate from library to home by clicking on CLARK logo in navbar.', () => {
        // Login 
        cy.login();

        // Click contribute button at bottom of page
        cy.get('#library-link').click();

        // Assert library URL 
        cy.url().should('include', 'library');

        // Return to home page 
        cy.get('#clark-logo').click();

        // Assert home URL
        cy.url().should('include', 'home');
    });
});