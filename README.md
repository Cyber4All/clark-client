[![CircleCI](https://circleci.com/gh/Cyber4All/clark-client/tree/master.svg?style=svg)](https://circleci.com/gh/Cyber4All/clark-client/tree/releases) [![Greenkeeper badge](https://badges.greenkeeper.io/Cyber4All/clark-client.svg)](https://greenkeeper.io/)

# CLARK
The official [CLARK Platform](https://clark.center) client, created with lots of :heart: by the Cyber4All team.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.7. A cheat sheet for the CLI can be found [here](https://cli.angular.io/reference.pdf).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Code Generation

### Code scaffolding with the Angular CLI
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Creating Singleton Services
All services which have one and only one instance per application or per feature collection module should be generated through the following processes.
#### For the Full Application
`ng g service core/SERVICE_NAME`
#### For a Feature Module
`ng g service FEATURE_MODULE/core/SERVICE_NAME`
#### Parameters
| Param | Value |
| ----- | ----- |
| SERVICE_NAME | The class name of your service |
| FEATURE_MODULE | `auth | onion | cube` |

### Creating Stateless, Reusable UI Types
All the "dumb" components, pipes, and directives should be implemented within a *Shared Module*. None of these types will import or inject services from *Core Modules* or other *Feature Modules*. All data passed to these types should be sent through attributes in the template of the component that uses them.

This is also the place to import and export third party UI modules.
#### For the Full Application
`ng g TYPE shared/TYPE_NAME`
#### For a Feature Module
`ng g TYPE FEATURE_MODULE/shared/TYPE_NAME`
#### Parameters
| Param | Value |
| ----- | ----- |
| TYPE | The class name of your UI type |
| TYPE_NAME | `component | directive | pipe` |
| FEATURE_MODULE | `auth | onion | cube` |

## Testing
### Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io).

When utilizing the Angular CLI to generate a new Angular Component, the CLI automatically generates a spec file for it. This spec file will, by default, only test that the component can be created. However, after adding things like additional components and dependencies, the original spec file can no longer run without changes.

#### Using `CUSTOM_ELEMENTS_SCHEMA` to test Angular components in isolation
If the component that's being tested has children components, those children components should not be included in the parent's test. To accomplish this, we can define a schema for the testing module to use that allows for the existence of so-called `custom elements`. A [custom element](https://angular.io/guide/elements) is piece of code used in much the same way that a standard HTML tag or Angular component is used in markup. When we tell Angular to expect custom elements in our component tests, we don't then need to import all of the children components because Angular will treat them like black boxes and not attempt to execute them. In this way, we can test the parent component in isolation.

```javascript
beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      ...
  })
})
```

### Angular Router and ActivatedRoute
In the event the target component uses the Angular Router or the Angular ActivatedRoute object, additional steps should be taken to ensure the tests pass. Any properties of the class that are accessed in the component should be stubbed out in the tests and then provided. For example, suppose our target component contains the following:

```javascript
import { Router } from '@angular/router'

constructor(private router: Router) {
    this.router.navigateByUrl('/home')
}
```

To make the tests for this component pass, first import the RouterTestingModule into the TestModule. Second, create a stub object that resembles the router and includes the properties the component is accessing. Finally, provide the Router in the TestModule and be sure to pass the stubbed object into the `useValue` parameter.

```javascript
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

// this is the value we'll provide for the Router class. We've only included the navigate function since that's the only part of the class the component accesses
const routerStub = {
    navigate: (commands: any[]) => { Promise.resolve(true); },
};

beforeEach(async(() => {
    imports: [ RouterTestingModule ], 
    ...
    providers: [
        // we pass in the stub value we created earlier
        { provide: Router, useValue: routerStub },
        ...
    ]
})
```
### Testing components with `@Input()` parameters
While `@Input()` parameters might seem special, they're no different than a parameter on any Javascript object. And since the component is also just a Javascript object, we can access them the same way. Assume for a moment that our target component has a parameter of `users` on it:

```javascript
import { Input } from '@angular/core' 

@Component({
    ...
})
export class MyComponent implements {
    @Input() users: string[];
    ...
}
```

In our component tests, we can simply give that `users` property a value in the beforeEach function as such:

```javascript
beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    // we can manually specify the value of this @Input() parameter before calling detectChanges()
    component.users = ['User One', 'User Two', ...];
    fixture.detectChanges();
  });
```

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
