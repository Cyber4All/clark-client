[![CircleCI](https://circleci.com/gh/Cyber4All/clark-client/tree/master.svg?style=svg)](https://circleci.com/gh/Cyber4All/clark-client/tree/master)

# CLARK
The official [CLARK Platform](https://clark.center) client, created with :heart: by the Cyber4All team.

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

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).