import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuildProgramComponentService {
  /**
   * The purpose of this component is to communicate between multiple components
   * the current framework selected. This allows the buildProgram component to display the
   * correct current framework and the guidelines related to it.
   */
  private currentFramework$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public currentFrameworkObservable: Observable<string> = this.currentFramework$.asObservable();

  constructor() { }

  /**
   * Updates the current framework for all components to observe
   *
   * @param framework The new framework to be displayed
   */
  updateCurrentFramework(framework: string) {
    this.currentFramework$.next(framework);
  }
}
