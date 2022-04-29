import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'clark-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  userName = '';
  password = '';

  constructor() { }

  ngOnInit(): void {
  }

  public submit(f: NgForm): void {
    console.log(f.value);
  }
}
