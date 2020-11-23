import { query, trigger, transition, style, animate } from '@angular/animations';

export const sidebarAnimations = [
  trigger('sidebar', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('200ms ease', style({ opacity: 1, height: '*' }))
      ], { optional: true }),
      query(':leave', [
        style({ opacity: 1, height: '*' }),
        animate('200ms ease', style({ opacity: 0, height: 0 }))
      ], { optional: true })
    ])
  ])
];
