import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
@Component({
  selector: 'clark-ncyte-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() collectionAbv: string;
  isUserAuthorized = false;
  constructor(
    private router: Router,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.isUserAuthorized = this.auth.accessGroups.includes('curator@ncyte')
      || this.auth.accessGroups.includes('admin') || this.auth.accessGroups.includes('editor@ncyte');
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: this.collectionAbv, currPage: 1 } });
  }

  navigateToStatistics() {
    this.router.navigate(['/collections/ncyte/dashboard']);
  }
}
