import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

export const userCardAnimations = [
  trigger('menu', [
    transition(':enter', [
      query('*', [
        style({ opacity: 0 })
      ]),
      style({ opacity: 0 }),
      animate('200ms ease', style({ opacity: 1 })),
      query('*', [
        stagger(35, [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          animate('200ms ease', style({ opacity: 1, transform: 'translateY(0px)' }))
        ])
      ])
    ]),
    transition(':leave', [
      style({ opacity: 1 }),
      animate('200ms ease', style({ opacity: 0 }))
    ]),
  ]),
];
