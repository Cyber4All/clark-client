import { trigger, transition, style, animate, query, stagger, animateChild, keyframes } from '@angular/animations';

const backToFront = [
  style({ backgroundColor: 'white', position: 'absolute', transform: 'translateY(0px) scale(0.9)', boxShadow: '0 2px 20px 1px rgba(0, 0, 0, 0.04)', left: 0, right: 0, zIndex: 1 }),
  animate('500ms 50ms ease', keyframes([
    style({ transform: 'translateY(50px) scale(0.95)', zIndex: 2, offset: 0.5 }),
    style({ transform: 'translateY(0px) scale(1)', boxShadow: '0 1px 6px 1px rgba(0, 0, 0, 0.0)', zIndex: 2, offset: 1 })
  ])),
];

const frontToBack = [
  style({ backgroundColor: 'white', transform: 'translateY(0px) scale(1)', boxShadow: '0 2px 20px 1px rgba(0, 0, 0, 0.04)', position: 'absolute', left: 0, right: 0, zIndex: 2 }),
  animate('550ms ease', keyframes([
    style({ transform: 'translateY(-50px) scale(0.95)', zIndex: 1, offset: 0.5 }),
    style({ transform: 'translateY(0px) scale(0.9)', boxShadow: '0 1px 6px 1px rgba(0, 0, 0, 0)', zIndex: 1, offset: 1 })
  ])),
];

export const card = trigger('card', [
  transition(':leave', frontToBack),
  transition(':enter', backToFront),
]);

export const nullAnimation = trigger('nullAnimation', [
  transition(':enter', [])
]);
