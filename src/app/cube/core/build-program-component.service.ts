import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuildProgramComponentService {
  private currentFramework$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public currentFrameworkObservable: Observable<string> = this.currentFramework$.asObservable();

  constructor() { }

  updateCurrentFramework(framework: string) {
    this.currentFramework$.next(framework);
  }
}
