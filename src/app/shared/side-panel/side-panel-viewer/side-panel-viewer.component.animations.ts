import { trigger, transition, style, animate } from '@angular/animations';

export const fade = trigger('fade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('250ms ease', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('250ms ease', style({ opacity: 0 }))
  ])
]);

export const slide = trigger('slide', [
  transition(':enter', [
    style({ transform: 'translateX({{ pixels }}px)', opacity: 1 }),
    animate('{{ outSpeed }}ms 150ms ease', style({ transform: 'translateX(0px)', opacity: 1 }))
  ], { params : { pixels: 400, outSpeed: 350, inSpeed: 250 } }),
  transition(':leave', [
    style({ transform: 'translateX(0px)', opacity: 1 }),
    animate('{{ inSpeed }}ms ease', style({ transform: 'translateX({{ pixels }}px)', opacity: 1 }))
  ], { params : { pixels: 400, outSpeed: 350, inSpeed: 250 } }),
])