import { trigger, transition, query, stagger, animateChild, style, animate } from '@angular/animations';

export const usersComponentAnimations = [
  trigger('staggerChildren', [
    transition('* => *', [
      query(':enter', [
        stagger(30, [
          animateChild()
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fade', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate('350ms ease', style({ opacity: 1, transform: 'translateY(0px)' }))
    ]),
    transition(':leave', [
      style({ opacity: 1, transform: 'translateY(0px)' }),
      animate('350ms ease', style({ opacity: 0, transform: 'translateY(20px)' }))
    ])
  ])
];
