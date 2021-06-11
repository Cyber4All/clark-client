import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'clark-header-ncyte',
  templateUrl: './header-ncyte.component.html',
  styleUrls: ['./header-ncyte.component.scss']
})
export class HeaderNcyteComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: 'ncyte', currPage: 1 }});
  }

}
