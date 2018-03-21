import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class LearningObjectStoreService {
  private _state;
  state;

  constructor() {
    this._state = {

    };
    this.state = new BehaviorSubject<STATE>(this._state);
  }

  dispatch(action: ACTION) {
    console.log(action);
    switch (action.type) {
      case 'INIT':
      this._state = {
          ...this._state,
          section: action.request.initialSection
        };
        break;
      case 'NAVIGATE':
        this._state = {
          ...this._state,
          section: action.request.hasOwnProperty('sectionIndex')
            ? action.request.sectionIndex : this._state.section + action.request.sectionModifier
        };
        break;
    }
    this.state.next(this._state);
  }

}
interface STATE {
  section: number;
}
interface ACTION {
  type: string;
  request: {
    initialSection?: number;
    sectionModifier?: number;
    sectionIndex?: number;
  };
}
