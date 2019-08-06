import { trigger, transition, style, animate } from '@angular/animations';

export const carousel = trigger('carousel', [
  transition('void => next', [
    style({ transform: 'translateX(600px)', opacity: 0, 'pointer-events': 'none' }),
    animate(
      '250ms 150ms ease-in-out',
      style({ transform: 'translateX(0) ', opacity: 1 })
    )
  ]),
  transition('next => void', [
    style({ transform: 'translateX(0)', opacity: 1, 'pointer-events': 'none' }),
    animate(
      '250ms ease-in-out',
      style({ transform: 'translateX(-600px)', opacity: 0 })
    )
  ]),
  transition('void => prev', [
    style({ transform: 'translateX(-600px)', opacity: 0, 'pointer-events': 'none' }),
    animate(
      '250ms 150ms ease-in-out',
      style({ transform: 'translateX(0)', opacity: 1 })
    )
  ]),
  transition('prev => void', [
    style({ transform: 'translateX(0)', opacity: 1, 'pointer-events': 'none' }),
    animate('250ms ease-in-out', style({ transform: 'translateX(600px)', opacity: 0 }))
  ])
]);
