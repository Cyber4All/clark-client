import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-error-status',
  templateUrl: './error-status.component.html',
  styleUrls: ['./error-status.component.scss']
})
export class ErrorStatusComponent {

  @Input() statusCode: number;
  @Input() redirectUrl: string;

  constructor(private router: Router, private auth: AuthService) { }

  login() {
    this.router.navigate(['auth'], { queryParams: { redirectUrl: this.redirectUrl } });
  }

}
