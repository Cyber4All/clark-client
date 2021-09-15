import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Collection } from 'app/core/collection.service';
import { sidebarAnimations } from './sidebar.component.animation';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() { }

  goBack() {
    this.router.navigate(['']);
  }

  isAdminOrEditor(): boolean {
    return this.authService.isAdminOrEditor();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
