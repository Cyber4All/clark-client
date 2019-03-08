import { Component, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Collection } from 'app/core/collection.service';
import { trigger, query, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'clark-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('sidebar', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, height: 0 }),
          animate('200ms ease', style({ opacity: 1, height: '*' }))
        ], { optional: true }),
        query(':leave', [
          style({ opacity: 1, height: '*' }),
          animate('200ms ease', style({ opacity: 0, height: 0 }))
        ], { optional: true })
      ])
    ])
  ]
})
export class SidebarComponent implements OnDestroy {
  destroyed$: Subject<void> = new Subject();

  @Input() collections: Collection[] = [];
  @Input() activeCollection: string;
  @Input() editorMode: boolean;

  @Input() initialized = false;

  constructor(private router: Router) {}

  /**
   * Navigate to previous location
   *
   * @memberof SidebarComponent
   */
  navigateBack() {
    // TODO this should take a redirect URL
    this.router.navigateByUrl('/'); // navigates home
  }

  ngOnDestroy() {
    // subscription clean up
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
