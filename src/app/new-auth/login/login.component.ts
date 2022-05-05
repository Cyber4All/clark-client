import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';

@Component({
  selector: 'clark-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  constructor(public authValidation: AuthValidationService) { }

  ngOnInit(): void {
  }
/**
 * TO-DO: implement this method, current implementation is
 * for testing only
 *
 * @param f form data
 */
  public submit(f: NgForm): void {
    console.log(f.value);//just for testing
    this.authValidation.showError();
  }

}
