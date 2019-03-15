import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-error-status',
  templateUrl: './error-status.component.html',
  styleUrls: ['./error-status.component.scss']
})
export class ErrorStatusComponent implements OnInit {

  @Input() statusCode: number;
  @Input() redirectUrl: string;

  constructor(private router: Router, private auth: AuthService) { }

  ngOnInit() {
  }

  login() {
    this.router.navigate(['auth'], { queryParams: { redirectUrl: this.redirectUrl } });
  }

}
