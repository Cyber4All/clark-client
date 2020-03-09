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
import { fromEvent, Subject } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent } from '../register.component';

import { map, debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements AfterViewInit, OnDestroy {
  @Input() group: FormGroup;
  @Output() hasResults = new EventEmitter();
  @ViewChild('emailInput', { read: ElementRef, static: true })
  emailInput: ElementRef;
  emailError = false;
  querying = false;
  result: boolean;
  currentOrganization: string;
  organizationsList = [];
  isValid: boolean;
  
  destroyed$: Subject<void> = new Subject();

  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngAfterViewInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    fromEvent(this.emailInput.nativeElement, 'input').pipe(
      map(x => x['currentTarget'].value),
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe(val => {
      this.querying = true;
      this.emailError = false;

      this.auth.usernameInUse(val).then((res: any) => {
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
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
