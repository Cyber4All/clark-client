import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-email-verified',
  templateUrl: './email-verified.component.html'
})
export class EmailVerifiedComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.refreshToken();
  }
}
