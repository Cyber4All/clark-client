import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AuthValidationService } from 'app/core/auth-validation.service';

@Component({
  selector: 'clark-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  isError: Boolean = true;
  emailsMatch: Boolean = true;
  currentEmail = new FormControl('');
  confirmEmail = new FormControl('');

  constructor(private authValidationService: AuthValidationService) {
  }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.isError = err);
  }

  showEmail(): void {
    console.log(this.currentEmail.value);
  }

  matchEmails(): void {
    this.currentEmail.value === this.confirmEmail.value ? this.emailsMatch = true : this.emailsMatch = false;
  }

}
