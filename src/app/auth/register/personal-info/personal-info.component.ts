import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import {FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent } from '../../register/register.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements OnInit, OnDestroy {
  @Input() group: FormGroup;
  @ViewChild('emailInput', { read: ElementRef })
  emailInput: ElementRef;
  emailError = false;
  querying = false;
  result: boolean;
  sub: Subscription;

  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.sub = Observable.fromEvent(this.emailInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(650)
      .subscribe(val => {
        this.querying = true;
        this.emailError = false;

        this.auth.identifiersInUse(val).then((res: any) => {
          this.querying = false;
          this.result = res.inUse;
          if (!this.result) {
            this.register.setInUseEmail(this.result);
            this.emailError = false;
          } else {
            this.emailError = true;
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
