import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'clark-with-cyber-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderWithCyberComponent {

  @Input() tag: string;
  isUserAuthorized = false;
  constructor(private router: Router) {}

  navigateToBrowse() {
    const params = {
      tags: ["6842ffa2a606cc25d400f99f"],
      currPage: 1,
      limit: 10,
      orderBy: "date",
      sortType: -1,
      status: "released"
    }
    this.router.navigate(['/browse'], { queryParams: params });
  }
}