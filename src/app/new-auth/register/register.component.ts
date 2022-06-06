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
