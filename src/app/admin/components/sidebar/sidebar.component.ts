import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Collection } from 'app/core/collection.service';
import { HistoryService, HistorySnapshot } from 'app/core/history.service';
import { sidebarAnimations } from './sidebar.component.animation';
import { AuthService } from 'app/core/auth.service';

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
  constructor(private history: HistoryService, private authService: AuthService) { }

  ngOnInit() {
    this.historySnapshot = this.history.snapshot();
  }

  isAdminOrEditor(): boolean {
    return this.authService.isAdminOrEditor();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
