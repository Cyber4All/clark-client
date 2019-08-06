import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Collection } from 'app/core/collection.service';
import { HistoryService } from 'app/core/history.service';
import { sidebarAnimations } from './sidebar.component.animation'

@Component({
  selector: 'clark-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: sidebarAnimations
})
export class SidebarComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject();

  @Input() collections: Collection[] = [];
  @Input() activeCollection: string;
  @Input() editorMode: boolean;

  @Input() initialized = false;

  navigateBack: Function;

  constructor(private router: Router, private history: HistoryService) { }

  ngOnInit() {
    this.navigateBack = this.history.snapshot();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
