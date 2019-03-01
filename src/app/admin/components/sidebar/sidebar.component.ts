import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { increaseElementDepthCount } from '@angular/core/src/render3/state';

@Component({
  selector: 'clark-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject();

  @Input() authorizedCollections: string[] = [];
  @Input() activeCollection: string;
  @Input() editorMode: boolean;

  @Input() initialized = false;

  constructor(private router: Router) {}

  ngOnInit() {}

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
