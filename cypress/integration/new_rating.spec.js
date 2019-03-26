describe('New Rating', () => {

    before(() => {
        // Return to home page before each test
        cy.fixture('route.json').then((route) => {
            cy.visit(route[0]);
        });

        // wait for page to load
        cy.wait(1000);

        cy.get('.learning-object').first().click({ force: true }, { multiple: true });

        cy.wait(1000);

        // TODO all login code can be removed when pulling ratings from server
        // Click author name
        cy.verifiedLogin();

        cy.wait(1000);

        cy.url().should('include', 'details');
    });

    it('Open new rating modal, rate, add comment, submit', () => {
        cy.get('.rating > a').first().click({ force: true }, {  multiple: true });

        cy.get('.new-rating-wrapper').should('be.visible').should('have.class', 'active');
        cy.get('.new-rating').should('be.visible');
        
        cy.get('.new-rating .empty-stars .star').eq(3).children('div').click({ force: true });

        cy.wait(500);

        cy.get('.new-rating').should('have.class', 'rated').find('.comment-wrapper').first().should('be.visible');

        cy.get('.new-rating .comment-wrapper textarea').type('Adding a comment whoop whoop');

        cy.get('.new-rating .comment-wrapper .button.good').click({ force: true });

        cy.wait(1000);

        cy.get('.new-rating-wrapper').should('not.be.visible').should('not.have.class', 'active');
        cy.get('.new-rating').should('not.be.visible');
    })

    it('Open new rating modal, click close', () => {
        cy.get('.rating > a').first().click({ force: true }, { multiple: true });

        cy.get('.new-rating-wrapper .close-new-rating').click({ force: true });

        cy.get('.new-rating-wrapper').should('not.be.visible').should('not.have.class', 'active');
        cy.get('.new-rating').should('not.be.visible');
    });
})