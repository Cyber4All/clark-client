export class ArgumentOutOfRangeError {
  message: any;
  name: any;
}
export class AsyncSubject {
  static create(destination: any, source: any): any;
  constructor(...args: any[]);
  asObservable(): any;
  complete(): void;
  error(error: any): void;
  forEach(next: any, promiseCtor: any): any;
  lift(operator: any): any;
  next(value: any): void;
  pipe(...args: any[]): any;
  subscribe(observerOrNext: any, error: any, complete: any): any;
  toPromise(promiseCtor: any): any;
  unsubscribe(): void;
}
export class BehaviorSubject {
  static create(destination: any, source: any): any;
  constructor(_value: any);
  asObservable(): any;
  complete(): void;
  error(err: any): void;
  forEach(next: any, promiseCtor: any): any;
  getValue(): any;
  lift(operator: any): any;
  next(value: any): void;
  pipe(...args: any[]): any;
  subscribe(observerOrNext: any, error: any, complete: any): any;
  toPromise(promiseCtor: any): any;
  unsubscribe(): void;
}
export class ConnectableObservable {
  static create(subscribe: any): any;
  constructor(source: any, subjectFactory: any);
  connect(): any;
  forEach(next: any, promiseCtor: any): any;
  getSubject(): any;
  lift(operator: any): any;
  pipe(...args: any[]): any;
  refCount(): any;
  subscribe(observerOrNext: any, error: any, complete: any): any;
  toPromise(promiseCtor: any): any;
}
export const EMPTY: {
  "@@observable": Function;
  forEach: Function;
  lift: Function;
  pipe: Function;
  subscribe: Function;
  toPromise: Function;
};
export class EmptyError {
  message: any;
  name: any;
}
export class GroupedObservable {
  static create(subscribe: any): any;
  constructor(key: any, groupSubject: any, refCountSubscription: any);
  forEach(next: any, promiseCtor: any): any;
  lift(operator: any): any;
  pipe(...args: any[]): any;
  subscribe(observerOrNext: any, error: any, complete: any): any;
  toPromise(promiseCtor: any): any;
}
export const NEVER: {
  "@@observable": Function;
  forEach: Function;
  lift: Function;
  pipe: Function;
  subscribe: Function;
  toPromise: Function;
};
export class Notification {
  static createComplete(): any;
  static createError(err: any): any;
  static createNext(value: any): any;
  constructor(kind: any, value: any, error: any);
  kind: any;
  value: any;
  error: any;
  hasValue: any;
  accept(nextOrObserver: any, error: any, complete: any): any;
  observe(observer: any): any;
  toObservable(): any;
}
export namespace Notification {
  const completeNotification: {
    accept: Function;
    do: Function;
    error: any;
    hasValue: boolean;
    kind: string;
    observe: Function;
    toObservable: Function;
    value: any;
  };
  const undefinedValueNotification: {
    accept: Function;
    do: Function;
    error: any;
    hasValue: boolean;
    kind: string;
    observe: Function;
    toObservable: Function;
    value: any;
  };
}
export class ObjectUnsubscribedError {
  message: any;
  name: any;
}
export class Observable {
  static create(subscribe: any): any;
  constructor(subscribe: any);
  forEach(next: any, promiseCtor: any): any;
  lift(operator: any): any;
  pipe(...args: any[]): any;
  subscribe(observerOrNext: any, error: any, complete: any): any;
  toPromise(promiseCtor: any): any;
}
export class ReplaySubject {
  static create(destination: any, source: any): any;
  constructor(bufferSize: any, windowTime: any, scheduler: any);
  asObservable(): any;
  complete(): void;
  error(err: any): void;
  forEach(next: any, promiseCtor: any): any;
  lift(operator: any): any;
  next(value: any): void;
  nextInfiniteTimeWindow(value: any): void;
  nextTimeWindow(value: any): void;
  pipe(...args: any[]): any;
  subscribe(observerOrNext: any, error: any, complete: any): any;
  toPromise(promiseCtor: any): any;
  unsubscribe(): void;
}
export class Scheduler {
  static now(): any;
  constructor(SchedulerAction: any, now: any);
  SchedulerAction: any;
  now: any;
  schedule(work: any, delay: any, state: any): any;
}
export class Subject {
  static create(destination: any, source: any): any;
  asObservable(): any;
  complete(): void;
  error(err: any): void;
  forEach(next: any, promiseCtor: any): any;
  lift(operator: any): any;
  next(value: any): void;
  pipe(...args: any[]): any;
  subscribe(observerOrNext: any, error: any, complete: any): any;
  toPromise(promiseCtor: any): any;
  unsubscribe(): void;
}
export class Subscriber {
  static create(next: any, error: any, complete: any): any;
  constructor(destinationOrNext: any, error: any, complete: any, ...args: any[]);
  add(teardown: any): any;
  complete(): void;
  error(err: any): void;
  next(value: any): void;
  remove(subscription: any): void;
  unsubscribe(): void;
}
export namespace Subscriber {
  const EMPTY: {
    add: Function;
    closed: boolean;
    remove: Function;
    unsubscribe: Function;
  };
}
export class Subscription {
  constructor(unsubscribe: any);
  closed: any;
  add(teardown: any): any;
  remove(subscription: any): void;
  unsubscribe(): void;
}
export namespace Subscription {
  const EMPTY: {
    add: Function;
    closed: boolean;
    remove: Function;
    unsubscribe: Function;
  };
}
export class TimeoutError {
  message: any;
  name: any;
}
export class UnsubscriptionError {
  constructor(errors: any);
  message: any;
  name: any;
  errors: any;
}
export class VirtualAction {
  static sortActions(a: any, b: any): any;
  constructor(scheduler: any, work: any, index: any);
  add(teardown: any): any;
  execute(state: any, delay: any): any;
  recycleAsyncId(scheduler: any, id: any, delay: any): any;
  remove(subscription: any): void;
  requestAsyncId(scheduler: any, id: any, delay: any): any;
  schedule(state: any, delay: any): any;
  unsubscribe(): void;
}
export namespace VirtualAction {
  const EMPTY: {
    add: Function;
    closed: boolean;
    remove: Function;
    unsubscribe: Function;
  };
}
export class VirtualTimeScheduler {
  static frameTimeFactor: number;
  static now(): any;
  constructor(SchedulerAction: any, maxFrames: any);
  flush(): void;
  schedule(work: any, delay: any, state: any): any;
}
export const animationFrameScheduler: {
  SchedulerAction: Function;
  actions: any[];
  active: boolean;
  flush: Function;
  now: Function;
  schedule: Function;
  scheduled: any;
};
export const asapScheduler: {
  SchedulerAction: Function;
  actions: any[];
  active: boolean;
  flush: Function;
  now: Function;
  schedule: Function;
  scheduled: any;
};
export const asyncScheduler: {
  SchedulerAction: Function;
  actions: any[];
  active: boolean;
  flush: Function;
  now: Function;
  schedule: Function;
  scheduled: any;
};
export function bindCallback(callbackFunc: any, resultSelector: any, scheduler: any): any;
export function bindNodeCallback(callbackFunc: any, resultSelector: any, scheduler: any): any;
export function combineLatest(...args: any[]): any;
export function concat(...args: any[]): any;
export const config: {
  Promise: any;
  useDeprecatedSynchronousErrorHandling: any;
};
export function defer(observableFactory: any): any;
export function empty(scheduler: any): any;
export function forkJoin(...args: any[]): any;
export function from(input: any, scheduler: any): any;
export function fromEvent(target: any, eventName: any, options: any, resultSelector: any): any;
export function fromEventPattern(addHandler: any, removeHandler: any, resultSelector: any): any;
export function generate(initialStateOrOptions: any, condition: any, iterate: any, resultSelectorOrObservable: any, scheduler: any, ...args: any[]): any;
export function identity(x: any): any;
export function iif(condition: any, trueResult: any, falseResult: any): any;
export function interval(period: any, scheduler: any): any;
export function isObservable(obj: any): any;
export function merge(...args: any[]): any;
export function never(): any;
export function noop(): void;
export const observable: string;
export function of(...args: any[]): any;
export function onErrorResumeNext(...args: any[]): any;
export function pairs(obj: any, scheduler: any): any;
export function pipe(...args: any[]): any;
export const queueScheduler: {
  SchedulerAction: Function;
  actions: any[];
  active: boolean;
  flush: Function;
  now: Function;
  schedule: Function;
  scheduled: any;
};
export function race(...args: any[]): any;
export function range(start: any, count: any, scheduler: any): any;
export function throwError(error: any, scheduler: any): any;
export function timer(dueTime: any, periodOrScheduler: any, scheduler: any): any;
export function using(resourceFactory: any, observableFactory: any): any;
export function zip(...args: any[]): any;
