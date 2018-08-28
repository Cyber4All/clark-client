describe('New Rating', () => {

    before(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4200/home');

        // wait for page to load
        cy.wait(1000);

        cy.get('.learning-object').first().click({ multiple: true });

        cy.wait(1000);

        // TODO all login code can be removed when pulling ratings from server
        // Click author name
        cy.login();

        cy.wait(1000);

        cy.url().should('include', 'details');
    });

    it('Open new rating modal, rate, add comment, submit', () => {
        cy.get('.rating > a').first().click({  multiple: true });

        cy.get('.new-rating-wrapper').should('be.visible').should('have.class', 'active');
        cy.get('.new-rating').should('be.visible');
        
        cy.get('.new-rating .empty-stars .star').eq(3).children('div').click();

        cy.wait(500);

        cy.get('.new-rating').should('have.class', 'rated').find('.comment-wrapper').first().should('be.visible');

        cy.get('.new-rating .comment-wrapper textarea').type('Adding a comment whoop whoop');

        cy.get('.new-rating .comment-wrapper .button.good').click();

        cy.wait(1000);

        cy.get('.new-rating-wrapper').should('not.be.visible').should('not.have.class', 'active');
        cy.get('.new-rating').should('not.be.visible');
    })

    it('Open new rating modal, click close', () => {
        cy.get('.rating > a').first().click({  multiple: true });

        cy.get('.new-rating-wrapper .close-new-rating').click();

        cy.get('.new-rating-wrapper').should('not.be.visible').should('not.have.class', 'active');
        cy.get('.new-rating').should('not.be.visible');
    });
})