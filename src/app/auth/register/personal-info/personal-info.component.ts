import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent } from '../register.component';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements AfterViewInit, OnDestroy {
  @Input() group: FormGroup;
  @Output() hasResults = new EventEmitter();
  @ViewChild('emailInput', { read: ElementRef })
  emailInput: ElementRef;
  emailError = false;
  querying = false;
  result: boolean;
  currentOrganization: string;
  organizationsList = [];
  isValid: boolean;
  // array of subscriptions to destroy on component destroy
  subs: Subscription[] = [];

  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngAfterViewInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(fromEvent(this.emailInput.nativeElement, 'input')
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
      })
    );
  }

  ngOnDestroy() {
    // unsubscribe from all observables
    for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }
  }
}
