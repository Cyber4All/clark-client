import { trigger, transition, query, style, animate, stagger } from '@angular/animations';

export const privilegesListAnimations = [
  trigger('privilege', [
    transition('* => *', [
      query(':leave', [
        style({ opacity: 1, transform: 'scale(1, 1)', height: '*' }),
        animate('200ms ease', style({ opacity: 0, transform: 'scale(1, 0)', height: 0 }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'scale(1, 0)', height: 0 }),
        stagger('50ms', [
          animate('200ms ease', style({ opacity: 1, transform: 'scale(1, 1)', height: '*' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('deleteConfirm', [
    transition(':enter', [
      style({ opacity: 0 }),
      query('div', [
        style({ opacity: 0, transform: 'translateX(100px)' })
      ]),
      animate('200ms ease', style({ opacity: 1 })),
      query('div', [
        stagger('50ms', [
          animate('150ms ease', style({ opacity: 1, transform: 'translateX(0px)' }))
        ])
      ])
    ]),
    transition(':leave', [
      style({ opacity: 1  }),
      query('div', [
        style({ opacity: 1, transform: 'translateX(0px)' }),
        stagger('50ms', [
          animate('150ms ease', style({ opacity: 0, transform: 'translateX(20px)' }))
        ])
      ]),
      animate('200ms ease', style({ opacity: 0 }))
    ])
  ])
];
