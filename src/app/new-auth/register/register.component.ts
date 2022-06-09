import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';

@Component({
  selector: 'clark-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  loginFailure = false;
  siteKey = '6LfS5kwUAAAAAIN69dqY5eHzFlWsK40jiTV4ULCV';

  constructor(public authValidation: AuthValidationService) { }

  ngOnInit(): void { }

  /**
   * TO-DO: implement this method
   *
   * @param f form data
   */
  public submit(form: NgForm): void {
    console.log(form.value);
  }

}
