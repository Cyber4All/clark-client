/// <reference types="cypress" />

import Chance from 'chance';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
const chance = new Chance();

describe('Cube', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });

    // /home tests
    // =============================================================
    it('Has page title', () => {
        cy.contains('Cybersecurity curriculum at your fingertips.');
    });

    it('Navbar renders correctly', () => {
        cy.get('.topbar').contains('C.L.A.R.K.');
        // cy.get('.nav-search-bar');
        cy.get('.topbar').contains('Sign in');
        cy.get('.topbar').contains('Register');
    });

    it('Sign in', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
    });

    it('Register new user', () => {
        cy.contains('Register').click();

        // Assert URL 
        cy.url().should('include', 'register');
    });

    it('Navigate to browse', () => {
        cy.contains('View All').click();

        // Assert URL 
        cy.url().should('include', 'browse');
    });

    it('Navigate to details', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'details');
    });

    it('Clicking display search without entering text does not search', () => {
        cy.contains('Search').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking navbar search without entering text does not search', () => {
        // Click search
        cy.contains('Search').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    it('Clicking display search after typing in it', () => {
        // Type in to search bar
        cy.get('.search-input').type('Nick');

        // Click search 
        cy.get('.button.bad').eq(0).click();

        // Assert URL 
        cy.url().should('include', 'query');
    });

    it('Click on contribute button (bottom of home page) while logged out.', () => {
        cy.contains('Contribute to CLARK').click();
        // Assert URL 
        cy.url().should('include', 'login');
    });

    it('Click on contribute button while logged in.', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click contribute button at bottom of page
        cy.contains('Contribute to CLARK').click();

        // Assert URL 
        cy.url().should('include', 'dashboard');
    });

    it('Navigate to library.', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click contribute button at bottom of page
        cy.get('.right.library').click();

        // Assert URL 
        cy.url().should('include', 'library');
    });

    it('Navigate from library to browse.', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click contribute button at bottom of page
        cy.get('.right.library').click();

        // Assert library URL 
        cy.url().should('include', 'library');

        // Return to home page 
        cy.contains('browsing some learning objects!').click();

        // Assert home URL
        cy.url().should('include', 'browse');
    });

    it('Navigate from library to home by clicking on CLARK logo in navbar.', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Click contribute button at bottom of page
        cy.get('.right.library').click();

        // Assert library URL 
        cy.url().should('include', 'library');

        // Return to home page 
        cy.get('.topbar').contains('C.L.A.R.K.').click();

        // Assert home URL
        cy.url().should('include', 'home');
    });
    // =============================================================
    // /details testing
    // =============================================================
    it('Navigate to details and click on author name to view author profile', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Click author name
        cy.get('.author').children('.link').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');
    });

    it('Navigate to details and click on login button', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Click author name
        cy.get('.login-msg').children('a').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert URL 
        cy.url().should('include', 'home');
    });

    // it('Navigate to details and click DOWNLOAD NOW button when logged out', () => {
    //     // Wait for learning objects to load on page
    //     cy.wait(1000);

    //     // Click left-most card
    //     cy.get('.learning-object').first().click({ multiple: true });

    //     // Click DOWNLOAD NOW button 
    //     // if disabled class is present, it is working correctly.
    //     cy.get('.inner').eq(1).children('.button.good.disabled').click();

    //     // Assert URL 
    //     cy.url().should('include', 'details');
    // });
    // =============================================================
    // /user testing
    // =============================================================
    it('Navigate to organization members page', () => {
        // Wait for learning objects to load on page
        cy.wait(1000);

        // Click left-most card
        cy.get('.learning-object').first().click({ multiple: true });

        // Click author name
        cy.get('.author').children('.link').first().click({ multiple: true });

        // Click organization link 
        cy.get('.organization').children('a').click();

        // Assert URL 
        cy.url().should('include', 'organization');
    });

    it('Navigate to personal profile page', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Wait for sign in process
        cy.wait(1000);

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');
    });

    it('Navigate to personal profile page and click edit profile', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Check for new page content 
        cy.contains('Edit Profile');
    });

    it('Navigate to personal profile page and click edit profile and click DISCARD CHANGES', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Click Discard Changes
        cy.get('.button.bad').click();

        // Check for new page content
        cy.get('.title');
    });

    it('Navigate to personal profile page and click edit profile and click SAVE', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Fill out name input 
        cy.get('input[name=firstname]').clear();
        cy.get('input[name=firstname]').type('Randy');

        // Click Save
        cy.get('.button.good').click();

        // Check for new name
        cy.contains('Randy');

         // Click Edit Profile
         cy.get('.edit').children('span').first().click();

         // Fill out name input 
         cy.get('input[name=firstname]').clear();
         cy.get('input[name=firstname]').type('Nick');
 
         // Click Save
         cy.get('.button.good').click();
 
         // Check for new name
         cy.contains('Nick');
    });

    it('Navigate to personal profile page and enter correct password to see if inputs appear', () => {
        // Click sign in button 
        cy.contains('Sign in').click();

        // Assert URL 
        cy.url().should('include', 'login');

        // Enter login info 
        cy.get('input[name=username]').type('nvisal1');
        cy.get('input[name=password]').type('122595');
        cy.get('.auth-button').click();

        // Assert new navbar elements
        cy.contains('Contribute');
        cy.get('.navbar-gravatar').click();
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Assert URL 
        cy.url().should('include', 'user');

        // Click Edit Profile
        cy.get('.edit').children('span').first().click();

        // Fill out name input 
        cy.get('input[name=password]').type('122595');
    
        // Check for new fields 
        cy.get('input[name="new password"]');
    });

    // =============================================================
    // /browse testing
    // =============================================================
    it('Click a card and see details page', () => {
        // Type in to search bar
        cy.get('.search-input').type('Nick');

        // Click search 
        cy.get('.button.bad').eq(0).click();

         // Assert URL 
         cy.url().should('include', 'browse');

        // Click first card and navigate to details page 
        cy.get('.learning-object').first().click();

        // Assert URL 
         cy.url().should('include', 'details');
    });

    it('Filter results', () => {
        // Type in to search bar
        cy.get('.search-input').type('Sidd');

        // Click search 
        cy.get('.button.bad').eq(0).click();

        // Pick filter options
        // Length
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').first().children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(1).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(2).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(3).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(4).children('span').children('clark-checkbox').children('.checkbox').click();
        
        // Academic level
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').first().children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(1).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(2).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(3).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(4).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(5).children('span').children('clark-checkbox').children('.checkbox').click();
    });

    it('Clear search', () => {
        // Type in to search bar
        cy.get('.search-input').type('Sidd');

        // Click search 
        cy.get('.button.bad').eq(0).click();

        // Click clear search
        cy.get('.content').children('.column-title').children('span').first().children('.clear-search').click();

        // Assert URL
        cy.url().should('include', 'browse');
    });
    
    it('Sort results', () => {
       // Type in to search bar
       cy.get('.search-input').type('Sidd');

       // Click search 
       cy.get('.button.bad').eq(0).click();

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

        // Pick sort option
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

        // Pick sort option
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').eq(1).click({ multiple: true });

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

        // Pick sort option
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').eq(2).click({ multiple: true });

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

         // Pick sort option
         cy.get('.popup.dropdown').eq(1).children('ul').children('li').eq(3).click({ multiple: true });

        // Finally, click the red x
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').children('.removeSort').children('.fa-times').click();
    });
});