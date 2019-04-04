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
            cy.visit(route['home']);
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
    it('Assert page title', () => {
        cy.get('#home-title');
    });

    it('Navbar renders correctly', () => {
        cy.get('#clark-logo');
        cy.get('#clark-sign-in');
        cy.get('#clark-register');
    });

    it('Sign in and log out', () => {
        // Login 
        cy.login();

        // Assert new navbar elements
        cy.get('#contributor-link');
        cy.get('#gravatar').click({ force: true });

        // Click Sign Out
        cy.get('#context-popup').children('ul').children('li').eq(2).click({ force: true }, { multiple: true });

        // Assert new navbar elements
        cy.get('#clark-sign-in');
        cy.get('#clark-register');
    });

    it('Assert registration', () => {
        cy.get('#clark-register').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'register');
    });

    it('Navigate to browse', () => {
        cy.get('#view-all').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'browse');
    });

    it('Navigate to details', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('#learning-object').first().click({ force: true }, { multiple: true });

        // Assert URL 
        cy.url().should('include', 'details');
    });

    it('Clicking display search without entering text does not search', () => {
        cy.get('#search-button').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking navbar search without entering text does not search', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click({ force: true });
        
        // Click search key
        cy.get('#clark-search-input').type('{enter}', { force: true });

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking display search after typing in it', () => {
        // Type in to search bar
        cy.get('#search-input').type(names[1], { force: true });

        // Click search 
        cy.get('#search-button').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'text');
    });

    it('Clicking navbar search after typing in it - Keyword search', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click({ force: true });
        
        // Type search query
        cy.get('#clark-search-input').type(names[0], { force: true });
        
        // Click search icon
        cy.get('#clark-search-input').type('{enter}', { force: true });

        // Assert URL 
        cy.url().should('include', 'browse');
    });

    it('Click on contribute button (bottom of home page) while logged out.', () => {
        cy.get('#contribute-to-clark').click({ force: true });
        // Assert URL 
        cy.url().should('include', 'login');
    });

    it('Clicking navbar and switching to outcome search should display new menu items', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click({ force: true });
        
        // Click outcomes search selector
        cy.get('#outcomes-option').click({ force: true });

        // Assert new menu icons
        cy.get('#search-sources');
    });

    it('Assert search dropdown description', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click({ force: true });
        
        // Type search query
        cy.get('#search-description');
    });

    it('Assert search dropdown exit', () => {
        // Trigger search dropdown
        cy.get('#clark-search-input').click({ force: true });
        
        // Click exit
        cy.get('#search-close').click({ force: true });
    });

    it('Click on contribute button while logged in.', () => {
        // Login 
        cy.login();

        // Click contribute button at bottom of page
        cy.get('#contribute-to-clark').click({ force: true });

        // Assert URL 
        cy.url().should('include', 'dashboard');
    });

    it('Navigate from library to home by clicking on CLARK logo in navbar.', () => {
        // Login 
        cy.login();

        // Click contribute button at bottom of page
        cy.get('#library-link').click({ force: true });

        // Assert library URL 
        cy.url().should('include', 'library');

        // Return to home page 
        cy.get('#clark-logo').click({ force: true });

        // Assert home URL
        cy.url().should('include', 'home');
    });

    it('Click on all the links in the footer.', () => {
        // Login 
        cy.login();

        // Click contribute button at bottom of page
        cy.get('#clark-stats').click({ force: true });
        cy.get('#clark-about').click({ force: true });
        cy.get('#clark-tutorial').click({ force: true });
    });
});