// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// import 'zone.js/dist/long-stack-trace-zone';
// import 'zone.js/dist/proxy.js';
// import 'zone.js/dist/sync-test';
// import 'zone.js/dist/jasmine-patch';
// import 'zone.js/dist/async-test';
// import 'zone.js/dist/fake-async-test';
// import { getTestBed } from '@angular/core/testing';
// import {
//   BrowserDynamicTestingModule,
//   platformBrowserDynamicTesting
// } from '@angular/platform-browser-dynamic/testing';

// // Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
// declare const __karma__: any;
// declare const require: any;

// // Prevent Karma from running prematurely.
// __karma__.loaded = function () {};

// // First, initialize the Angular testing environment.
// getTestBed().initTestEnvironment(
//   BrowserDynamicTestingModule,
//   platformBrowserDynamicTesting()
// );
// // Then we find all the tests.
// const context = require.context('./', true, /\.spec\.ts$/);
// // And load the modules.
// context.keys().map(context);
// // Finally, start Karma to run the tests.
// __karma__.start();



'use strict';

require('core-js/es6/reflect');
require('core-js/es7/reflect');
require('zone.js/dist/zone.js');
require('zone.js/dist/proxy.js');
require('zone.js/dist/sync-test');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');
require('jest-zone-patch');
const AngularSnapshotSerializer = require('./AngularSnapshotSerializer');
const HTMLCommentSerializer = require('./HTMLCommentSerializer');
const getTestBed = require('@angular/core/testing').getTestBed;
const BrowserDynamicTestingModule = require('@angular/platform-browser-dynamic/testing').BrowserDynamicTestingModule;
const platformBrowserDynamicTesting = require('@angular/platform-browser-dynamic/testing').platformBrowserDynamicTesting;

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
