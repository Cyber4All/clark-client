import { Component, OnInit, Input, forwardRef, ViewChild, ElementRef} from '@angular/core';
import { NgControl, FormGroup, FormControl, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent} from '../../register/register.component';

@Component({
  selector: 'clark-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'], 
})
export class ProfileInfoComponent implements OnInit {
  @Input() group: FormGroup;
  @ViewChild('usernameInput', {read: ElementRef}) usernameInput: ElementRef; 
  result: boolean; 

  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngOnInit() {

    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    Observable.fromEvent(this.usernameInput.nativeElement, 'input').map(x => x['currentTarget'].value).debounceTime(650).subscribe(val => {
      this.auth.identifiersInUse(val).then(res => {
        let data = JSON.parse(JSON.stringify(res));
        this.result = data.inUse;
        if (!this.result) { 
          this.register.setInUseUsername(this.result);
        } else {
          this.register.error("This username is already taken"); 
          this.register.setInUseUsername(this.result);
        }
     })
    }
  )}
}
