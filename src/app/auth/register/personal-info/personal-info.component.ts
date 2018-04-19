import {
  Component,
  OnInit,
  Input,
  Output,
  forwardRef,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { NgControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent } from '../../register/register.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements OnInit, OnDestroy {
  @Input() group: FormGroup;
  @ViewChild('emailInput', { read: ElementRef })
  emailInput: ElementRef;
  result: boolean;
  sub: Subscription;

  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.sub = Observable.fromEvent(this.emailInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(650)
      .subscribe(val => {
        this.auth.identifiersInUse(val).then(res => {
          const data = JSON.parse(JSON.stringify(res));
          this.result = data.inUse;
          if (!this.result) {
            this.register.setInUseEmail(this.result);
          } else {
            this.register.error('This email is already taken');
            this.register.setInUseEmail(this.result);
          }
        });
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
