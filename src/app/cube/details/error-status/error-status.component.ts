import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-error-status',
  templateUrl: './error-status.component.html',
  styleUrls: ['./error-status.component.scss']
})
export class ErrorStatusComponent implements OnInit {

  statusCode: number;
  redirectUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService, private nav: NavbarService) { }

  ngOnInit() {
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
    this.router.navigate(['auth'], { queryParams: { redirectUrl: this.redirectUrl } });
  }

}
