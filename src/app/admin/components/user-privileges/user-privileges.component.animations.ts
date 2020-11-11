import { trigger, transition, style, animate } from '@angular/animations';

export const userPrivilegesAnimations = [
  trigger('noPrivileges', [
    transition(':leave', [
      style({ opacity: 1, transform: 'scale(1, 1)' }),
      animate('300ms ease', style({ opacity: 0, transform: 'scale(1, 0.6)' })),
    ]),
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(1, 0.6)' }),
      animate('300ms ease', style({ opacity: 1, transform: 'scale(1, 1)' }))
    ])
  ])
];
