import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class LearningObjectStoreService {
  private _state;
  state;
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
  constructor() {
    this._state = {
      sidebar: {
        links: this.links
      }
    };
    this.state = new BehaviorSubject<STATE>(this._state);
  }

  dispatch(action: ACTION) {
    switch (action.type) {
      case 'INIT':
        this._state = {
          ...this._state,
          section: action.request.initialSection,
          noPage: false
        };
        break;
      case 'NAVIGATE':
        this._state = {
          ...this._state,
          section: action.request.hasOwnProperty('sectionIndex')
            ? action.request.sectionIndex
            : this._state.section + action.request.sectionModifier,
          childSection: undefined,
          noPage: false
        };
        break;
      case 'NAVIGATECHILD':
        this._state = {
          ...this._state,
          childSection: action.request.hasOwnProperty('sectionIndex')
            ? action.request.sectionIndex
            : this._state.section + action.request.sectionModifier,
          noPage: false
        };
        break;
      case 'NAVIGATEPARENT':
        this._state = {
          ...this._state,
          section: action.request.hasOwnProperty('sectionIndex')
            ? action.request.sectionIndex
            : this._state.section + action.request.sectionModifier,
          childSection: undefined,
          noPage: true
        };
        break;
      case 'UPDATE_SIDEBAR_TEXT':
        const index = this._state.childSection;
        this._state = {
          ...this._state,
          sidebar: {
            links: this._state.sidebar.links.map((link, linkIndex) =>
              linkIndex === 1 ?
                {
                  ...link,
                  children: this._state.sidebar.links[1].children.map((outcomeLink, i) =>
                    i === index
                      ? { ...outcomeLink, name: action.request.name }
                      : outcomeLink
                  )
                }
                : link
            )
          }
        };
        break;
    }
    this.state.next(this._state);
  }
}
interface STATE {
  section: number;
  childSection: number;
  noPage: boolean;
  sidebar: { links: SidebarLink[] };
}
interface ACTION {
  type: string;
  request: {
    initialSection?: number;
    sectionModifier?: number;
    sectionIndex?: number;
    name?: string;
  };
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
