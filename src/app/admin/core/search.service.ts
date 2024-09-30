import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  needsChange$: Subject<void> = new Subject();

  constructor() {}

  registerChange() {
    this.needsChange$.next();
  }
}
