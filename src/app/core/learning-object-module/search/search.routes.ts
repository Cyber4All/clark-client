import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';

const needsChange$: Subject<void> = new Subject<void>();

export const SEARCH_ROUTES = {
  needsChange$,
  REGISTER_CHANGE() {
    this.needsChange$.next();
  },

  SEARCH_LEARNING_OBJECTS: `${environment.apiURL}/learning-objects`,
  SEARCH_LEARNING_OBJECTS_WITH_FILTER(query: string) {
    return `${environment.apiURL}/learning-objects?${query}`;
  },
};
