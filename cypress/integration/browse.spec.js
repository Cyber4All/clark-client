 /// <reference types="cypress" />
 // *********************************************************************
 // Important note about the use of selectors when writing Cypress tests:
 //     Do not select elements by class name as they are highly volatile.
 //     Instead, refence all selections by id.
 // *********************************************************************

describe('Browse', () => {

    let home;
    let names;

    beforeEach(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            home = route;
            cy.visit(home['home']);
        });
        cy.fixture('names.json').then((name) => {
            names = name;
        });
    });   
    // =============================================================
    // /browse testing
    // =============================================================
    it('Click a card and see details page', () => {
        cy.get('#view-all').click({ force: true })

        // Wait for learning object cards to load
        cy.wait(2000);

        // Assert URL 
        cy.url().should('include', 'browse');

        // Click first card and navigate to details page 
        cy.get('#learning-object').first().click({ force: true });

        // Assert URL 
        cy.url().should('include', 'details');
    });

    it('Filter results', () => {
        // Type in to search bar
        cy.get('#search-input').type(names[0], { force: true });

        // Click search 
        cy.get('#search-button').eq(0).click({ force: true });

        // Pick filter options
        // Length
        cy.get('#clark-filter').children('#filter-section').children('#filter-section-inner').children('#filter-section-type').children('#filter-checkbox').first().children('span').children('clark-checkbox').children('#checkbox').click({ force: true });
        
        // Academic level
        cy.get('#clark-filter').children('#filter-section').eq(1).children('#filter-section-inner').children('#filter-section-type').children('#filter-checkbox').first().children('span').children('clark-checkbox').children('#checkbox').click({ force: true });
    });

    it('Clear search', () => {
        // Type in to search bar
        cy.get('#search-input').type(names[0], { force: true });

        // Click search 
        cy.get('#search-button').eq(0).click({ force: true });

        // Click clear search
        cy.get('#content').children('#column-title').children('span').first().children('#clear-search').click({ force: true });

        // Assert URL
        cy.url().should('not.include', 'text=');
    });
    
    it('Sort results', () => {
        // Type in to search bar
        cy.get('#search-input').type(names[0], { force: true });

        // Click search 
        cy.get('#search-button').eq(0).click({ force: true });

        // Click Sort
        cy.get('#content').children('#column-title').children('#results-options').children('#sort').click({ force: true });

        // Pick sort option
        cy.get('#context-popup').children('ul').children('li').first().click({ force: true }, { multiple: true });

        // Click Sort
        cy.get('#content').children('#column-title').children('#results-options').children('#sort').click({ force: true });

        // Pick sort option
        cy.get('#context-popup').children('ul').children('li').eq(1).click({ force: true }, { multiple: true });

        // Click Sort
        cy.get('#content').children('#column-title').children('#results-options').children('#sort').click({ force: true });

        // Pick sort option
        cy.get('#context-popup').children('ul').children('li').eq(2).click({ force: true }, { multiple: true });

        // Click Sort
        cy.get('#content').children('#column-title').children('#results-options').children('#sort').click({ force: true });

        // Pick sort option
        cy.get('#context-popup').children('ul').children('li').eq(3).click({ force: true }, { multiple: true });

        // Finally, click the red x
        cy.get('#content').children('#column-title').children('#results-options').children('#sort').children('#removeSort').children('#times').click({ force: true });
    });

    it('Select a filter and then clear filters', () => {
        cy.visit(home[1]);
        cy.wait(1000);

        // select filter and wait 1 second for query to fire (this is debounced 650ms in the client!)
        cy.get('#filter-section-type #checkbox').first().click( { force: true }, { multiple: true });
        cy.wait(1000);

        // check clearing filters
        cy.get('#filters-clear-all').first().click({ force: true }, { multiple: true });
        cy.wait(1000);
    })
});