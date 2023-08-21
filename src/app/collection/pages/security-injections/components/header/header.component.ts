import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'clark-secinj-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class SecurityInjectionsHeaderComponent implements OnInit {

  @Input () collectionAbv: string;
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: this.collectionAbv, currPage: 1 }});
  }

}
