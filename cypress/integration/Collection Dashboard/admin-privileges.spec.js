/// <reference types="cypress" />

describe('Admins should be able to add and remove curator/reviewer privileges from users for any collection', () => {
  let home, collection_dashboard;
  const routes = ['analytics', 'objects', 'users'] 

  before(() => {

    // clear any left-over auth cookies
    cy.clearCookie('presence');

    cy.fixture('route.json').then((route) => {
      home = route['home'];
      collection_dashboard = route['collection-dashboard']

      // route to home page
      cy.visit(home);

      // login as an admin
      cy.adminLogin();

      // route to the collection dashboard
      cy.visit(route['collection-dashboard'])
    });
  });

  beforeEach(() => {
    cy.viewport('macbook-13');

    // preserve auth cookie for each test
    Cypress.Cookies.preserveOnce('presence');
  });

  
  it('should appear on screen', () => {
    cy.visit(collection_dashboard + '/' + routes[2]);

    cy.url().should('include', '/admin/users');
    
    // use force here because there is no hover so the menu is invisible
    cy.get('.user-cards .card').eq(0).get('.card__middle__objects').eq(1).click({ force: true })
  });

  it('should allow addition of reviewer privilege', () => {
    cy.visit(collection_dashboard + '/' + routes[2]);
    
    // use force here because there is no hover so the menu is invisible
    cy.get('.user-cards .card').eq(0).get('.card__middle__objects').eq(1).click({ force: true })

    cy.get('.privileges__top .button.good').click();

    cy.get('.role-selector').should('be.visible').find('.role-selector__role').eq(0).click()

    cy.get('.collections-grid').should('be.visible').find('.collection-chooser__collection').eq(0).click()

    cy.get('.privileges__top .button.good').should('not.have.class', 'disabled').click()

    cy.get('.privileges__list').should('be.visible').find('.privileges__privilege').should('be.visible').should('contain', 'reviewer')
  });

  it('should allow addition of curator privilege', () => {
    cy.visit(collection_dashboard + '/' + routes[2]);
    
    // use force here because there is no hover so the menu is invisible
    cy.get('.user-cards .card').eq(0).get('.card__middle__objects').eq(1).click({ force: true })

    cy.get('.privileges__top .button.good').click();

    cy.get('.role-selector').should('be.visible').find('.role-selector__role').eq(1).click()

    cy.get('.collections-grid').should('be.visible').find('.collection-chooser__collection').eq(0).click()

    cy.get('.privileges__top .button.good').should('not.have.class', 'disabled').click()

    cy.get('.privileges__list').should('be.visible').find('.privileges__privilege').should('be.visible').should('contain', 'curator')
  });

  it('should remove a privilege', () => {
    cy.visit(collection_dashboard + '/' + routes[2]);
    
    // use force here because there is no hover so the menu is invisible
    cy.get('.user-cards .card').eq(0).get('.card__middle__objects').eq(1).click({ force: true })

    cy.get('.privileges__list').should('be.visible').find('.privileges__privilege').each(el => {
      el.find('.privilege__delete').click();
      cy.wait(1000);
    })

    cy.get('.privileges__list').should('not.be.visible');
  });
});


// should we clear the privileges of this user after the tests are done?
// cy.get('.privileges').eq(0).should('be.visible').get('.privileges__privilege').each(el => {
//   el.find('.privilege__delete').click()
// })