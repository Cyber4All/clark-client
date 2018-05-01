import { Injectable } from '@angular/core';

@Injectable()
export class SidebarService {

  links: SidebarLink[] = [
    {
      name: '1. Basic Information',
      action: navigate,
    },
    {
      name: '2. Learning Outcomes',
      action: navigate,
      children: [
        {
          name: 'New Learning Outcome',
          action: createOutcome,
          externalAction: true,
          classes: 'new'
        }
      ]
    }
  ];

  constructor() { }
}

interface SidebarLink {
  name: string;
  action: Function;
  classes?: string;
  children?: SidebarLink[];
  externalAction?: boolean;
}

export function createOutcome(i, self = this) {
  self.newOutcome.emit();
}

// these contain references to 'self' because they're being passed as parameters to the Angular HTML where 'this' isn't the same
export function navigate(i, self = this, parent = false) {
  const t = parent ? 'NAVIGATEPARENT' : 'NAVIGATE';
  self.store.dispatch({
    type: t,
    request: {
      sectionIndex: i
    }
  });
}
