import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './core/auth.service';
import { NavbarService } from './core/navbar.service';

@Component({
  selector: 'clark-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {

  statusCode: number;
  redirectUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService, private nav: NavbarService) { }

  ngOnInit() {
    this.nav.show();
    this.route.queryParams.subscribe(query => {
      if (query) {
        this.statusCode = query.errorStatus;
        if (query.redirectUrl) {
          this.redirectUrl = query.redirectUrl;
        }
      }
    });
  }

  login() {
    this.router.navigate(['auth']);
  }
}
