import { Component, Input, OnInit } from '@angular/core';
import { AuthValidationService } from 'app/core/auth-module/auth-validation.service';
@Component({
  selector: 'clark-error-banner',
  templateUrl: './error-banner.component.html',
  styleUrls: ['./error-banner.component.scss']
})
export class ErrorBannerComponent implements OnInit {

  isError: Boolean = true;
  @Input() errorMessage: String = 'You have 5 login attempts per hour.';

  constructor(public authValidation: AuthValidationService) {
  }
  ngOnInit(): void {
    this.authValidation.getErrorState().subscribe(err => this.isError = err);
  }


}
