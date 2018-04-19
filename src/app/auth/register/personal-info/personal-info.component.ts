import { Component, OnInit, Input, Output, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NgControl, FormGroup, FormControl, Validators} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent} from '../../register/register.component';

@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'], 
})

export class PersonalInfoComponent implements OnInit {
  @Input() group: FormGroup;
  @ViewChild('emailInput', {read: ElementRef}) emailInput: ElementRef;
  emailValidation : any; 
  result: boolean; 

  constructor(private auth: AuthService, private register: RegisterComponent) { }

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    Observable.fromEvent(this.emailInput.nativeElement, 'input').map(x => x['currentTarget'].value).debounceTime(650).subscribe(val => {
      this.auth.identifiersInUse(val).then(res => {
        let data = JSON.parse(res);
        this.result = data.inUse;
        if (this.result) { 
          this.register.setEmailValidation(this.result);
        } else {
          this.register.error("This email is already taken"); 
          this.register.setEmailValidation(this.result);
        }
     })
    }
  )}
}

