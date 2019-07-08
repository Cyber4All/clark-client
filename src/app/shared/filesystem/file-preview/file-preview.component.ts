import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit {
  private isDestroyed$ = new Subject<void>();
  loggedin: boolean;

  constructor(public auth: AuthService) { }

  ngOnInit() {
    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe(val => {
      this.loggedin = val;
    });
  }

}
