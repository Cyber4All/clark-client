import { trigger, transition, style, animate, query, stagger, animateChild } from '@angular/animations';

export const translateDown = trigger('translateDown', [
  transition(':enter', [
    style({ transform: 'translateY(-50px)', opacity: 0 }),
    animate('200ms ease', style({ transform: 'translateY(0px)', opacity: 1 }))
  ]),
]);

export const sidePanelEnter = trigger('sidePanelEnter', [
  transition(':enter', [
    query('@*', [
      stagger('70ms', [
        animate('200ms ease'), // delay for the panel to animate on
        animateChild()
      ])
    ], { optional: true })
  ]),
]);

export const buttonWipeRight = trigger('buttonWipeRight', [
  transition(':enter', [
    query('div', style({ opacity: 0, transform: 'translateX(-30px)' })),
    style({ opacity: 0, transform: 'scale(0, 1)' }),
    animate('300ms 80ms ease', style({ opacity: 1, transform: 'scale(1)' })),
    query('div', animate('200ms 80ms ease', style({ opacity: 1, transform: 'translateX(0px)' })))
  ]),
]);
