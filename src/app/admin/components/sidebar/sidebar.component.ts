import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Collection } from 'app/core/collection.service';
import { HistoryService, HistorySnapshot } from 'app/core/history.service';
import { sidebarAnimations } from './sidebar.component.animation';

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

  historySnapshot: HistorySnapshot;
  constructor(private history: HistoryService) { }

  ngOnInit() {
    this.historySnapshot = this.history.snapshot();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
