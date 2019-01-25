/// <reference types="cypress" />

// *********************************************************************
// Important note about the use of selectors when writing Cypress tests:
//     Do not select elements by class name as they are highly volatile.
//     Instead, refence all selections by id.
// *********************************************************************

describe('Learning Object Builder', () => {
    let home, builder, dashboard;
    let object, objectId;
    const routes = ['info', 'outcomes', 'materials'];

    before(() => {
        // clear auth cookie for next test
        cy.clearCookie('presence');

        cy.fixture('route.json').then((route) => {
            home = route['home'];
            builder = route['builder'];
            dashboard = route['dashboard'];

            cy.visit(home);

            // Log in as a user with a verified email
            cy.verifiedLogin();

            // clean up lingering test objects for next run
            cy.visit(dashboard);

            cy.deleteTestObject();
        });

        cy.fixture('objects.json').then((objects) => {
            object = objects[objects.length - 1];
        })
    })

    beforeEach(() => {
        cy.viewport('macbook-13');

        // preserve auth cookie for each test
        Cypress.Cookies.preserveOnce('presence');
    });

    it('checks that routing to builder occured successfully', () => {
        cy.visit(builder);

        cy.url().should('include', '/learning-object-builder');

        // verify that the builder component was rendered to the screen
        cy.get('clark-learning-object-builder');
    });

    it('checks that name input is focused', () => {
        cy.visit(builder);

        cy.focused().should('have.attr', 'name', 'name');
    });

    it('should create a new object by inputing giving it a name', () => {
        cy.visit(builder);

        // enter a name for a learning object
        cy.focused().type(object);

        // wait for auto save
        cy.wait(2000);

        // navigate to dashboard and search for an element containing the string of the object variable
        cy.visit(dashboard);

        cy.contains(object);
    });

    it('should open an existing object', () => {
        cy.visit(dashboard);

        cy.editTestObject();

        // extract the objects id from the url to avoid going to the dashboard and clicking the context menu for each test
        const url = cy.url().then(url => {
            objectId = url.split('/')[url.split('/').length - 2];
        })

        // check that the focused input is the name and that the focused input contains the string of the object variable
        cy.focused().should('have.attr', 'name', 'name').should('have.value', object);
    });

    it('should enter a description', () => {
        cy.editTestObject(objectId);

        // wait for animations
        cy.wait(2000);

        // using a should here will retry until this passes so it will automatically await properly
        cy.get(".cke_wysiwyg_frame").should(function($iframe) {
            const body = $iframe.contents().find("body").get(0);
            // expect(body).to.be.ok
            cy.wrap(body).type("<p>'this is dope as the pope using soap on a roap'</p>");
        })
    });

    // TODO check name of contributor pill after insertion
    it('should add a contributor to the object', () => {
        cy.editTestObject(objectId);

        // focus the contributor input and type 'test'
        cy.get('clark-user-dropdown input[type=text]').should('have.value', '').type('test');

        // select the item from the results containing 'testaccount'
        cy.get('clark-user-dropdown li').contains('testaccount').click({ force: true });

        // check that the contributor exists in the DOM
        cy.get('clark-contributor-pill .contributor-pill').contains('Test Account');

        // wait for autosave
        cy.wait(2000);

        cy.editTestObject(objectId);

        // check that the contributor exists in the DOM
        cy.get('clark-contributor-pill .contributor-pill').contains('Test Account');
    });

    it('should remove a contributor from the object', () => {
        cy.editTestObject(objectId);

        // hover the contributor pill
        cy.get('clark-contributor-pill .contributor-pill').contains('Test Account').trigger('mouseover');

        // click the delete button in the hover menu
        cy.get('.contributor-pill__dropdown-option').click({ force: true });

        // wait for autosave
        cy.wait(2000);


        cy.editTestObject(objectId);

        // ensure that contributor doesn't exist in DOM
        cy.get('clark-contributor-pill .contributor-pill').should('not.exist');
    });

    it('should change the length of the test object to \'Course\'', () => {
        cy.editTestObject(objectId)

        // set selected length to Course
        cy.get('select[name=type]').select('course');

        // wait for autosave
        cy.wait(2000);

        cy.visit(dashboard);

        // check on dashboard that test object row is of length Course
        cy.get('.row-item').contains(object).next().should('have.text', 'Course');

        cy.editTestObject(objectId)

        // check that upon reloading the test object the length is still set to course
        cy.get('select[name=type]').should('have.value', 'course')
    });

    it('should add an academic level to the test object', () => {
        cy.editTestObject(objectId);

        // select the first unselected level and click it
        cy.get('.levels .pill:not(.selected)').eq(0).click({ force: true });

        // check that there are now two pills selected
        cy.get('.levels .pill.selected').should('have.length', 2);

        // wait for autosave
        cy.wait(2000);

        cy.editTestObject(objectId);

        // check again that there are two levels selected
        cy.get('.levels .pill.selected').should('have.length', 2);
    });

    it('should remove an academic level to the test object', () => {
        cy.editTestObject(objectId);

        // select the first unselected academic level and click it
        cy.get('.levels .pill.selected').eq(0).click({ force: true });

        // verify that there is only one academic level selected now
        cy.get('.levels .pill.selected').should('have.length', 1);

        // wait for autosave
        cy.wait(2000);

        cy.editTestObject(objectId);

        // again verify that there is only one selected academic level
        cy.get('.levels .pill.selected').should('have.length', 1);
    });

    it('should route to Learning Outcomes page', () => {
        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes')

        cy.url().should('include', '/outcomes');
    });

    it('should create a new blank outcome', () => {
        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes')

        // make sure that the object has no outcomes
        cy.get('clark-outcome').should('not.exist');

        // select the new outcome button and click it
        cy.get('.main-column .top .button.good').contains('New').click({ force: true });

        // ensure that there's an instance of clark-outcome component in the DOM and that it's title is Learning Outcome 1
        cy.get('clark-outcome').contains('Learning Outcome 1');
    });

    it('should create a new outcome with typeahead', () => {
        const testString = 'Understand parallel computing';

        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // verify that there are no instances of clark-outcome component in DOM
        cy.get('clark-outcome').should('not.exist');

        // target amd click the new outcome button
        cy.get('.main-column .top .button.good').contains('New').click({ force: true });

        // verify that a new blank outcome was aded to the DOM
        cy.get('clark-outcome').contains('Learning Outcome 1');

        // target the newly added learning outcome's typeahead input and type our test string
        cy.get('clark-outcome').contains('Learning Outcome 1').get('.outcome-text .typeahead input[type=text]').should('have.value', '').type(testString);

        // verify that the outcome now contains are test string as a title
        cy.get('clark-outcome').contains(testString);

        // verify that the typeahead selected the correct blooms level
        cy.get('.level-select .level.active').contains('remember & understand');

        // verify that the typeahead verb contains 'Understand'
        cy.get('.typeahead .verb').contains('Understand').click({ force: true });

        // verify that the typeahead input contains test string minus the verb
        cy.get('.typeahead input').should('have.value', testString.substring(testString.indexOf(' ') + 1));

        // wait for autosave
        cy.wait(2000);

        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // ensure that the outcome saved correctly
        cy.get('clark-outcome').contains(testString);

        cy.get('.level-select .level.active').contains('remember & understand');

        cy.get('.typeahead .verb').contains('Understand');

        cy.get('.typeahead input').should('have.value', testString.substring(testString.indexOf(' ') + 1));
    });

    it('should map a suggested standard outcome to an outcome', () => {
        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // click the first standard outcome in the right panel
        cy.get('clark-standard-outcomes .results .outcomes-list-item').eq(0).click({ force: true });

        // verify that there is now one standard outcome selected
        cy.get('clark-standard-outcomes .results .outcomes-list-item.selected').should('have.length', 1);

        cy.get('clark-outcome').contains('K0063')

        // wait for autosave
        cy.wait(2000);

        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // verify that there is now one standard outcome selected
        cy.get('clark-standard-outcomes .results .outcomes-list-item.selected').should('have.length', 1);

        cy.get('clark-outcome').contains('K0063')
    });

    it('should unmap a suggested standard outcome from an outcome', () => {
        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // select and click the delete button in the test objects outcomes mapping
        cy.get('clark-outcome .outcome-mappings .pill span').click({ force: true });

        // verify that the outcome-mappings element is not in the DOM
        cy.get('clark-outcome .outcome-mappings').should('not.exist');

        // verify that there are no selected outcomes in the standard outcomes suggestion component
        cy.get('clark-standard-outcomes .results .outcomes-list-item.selected').should('have.length', 0);

        cy.wait(2000);

        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // verify that the outcome-mappings element is not in the DOM
        cy.get('clark-outcome .outcome-mappings').should('not.exist');

        // verify that there are no selected outcomes in the standard outcomes suggestion component
        cy.get('clark-standard-outcomes .results .outcomes-list-item.selected').should('have.length', 0);
    })

    it('should delete an outcome', () => {
        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // select the delete button on the only outcome and click it
        cy.get('clark-outcome').contains('Delete').click({ force: true });

        // verify that there are no outcomes in the DOM
        cy.get('clark-outcome').should('not.exist');

        // wait for autosave
        cy.wait(2000);

        cy.editTestObject(objectId);

        cy.navigateBuilder('Learning Outcomes');

        // verify again that there are no outcomes in the DOM
        cy.get('clark-outcome').should('not.exist');
    });

    it('should navigate to materials page', () => {
        cy.editTestObject(objectId);

        cy.navigateBuilder('Materials');

        cy.url().should('include', 'materials');
    });

    after(() => { })
});