import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import {FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../../core/auth.service';
import { RegisterComponent } from '../../register/register.component';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() group: FormGroup;
  @ViewChild('emailInput', { read: ElementRef })
  emailInput: ElementRef;
  @ViewChild('organization', { read: ElementRef })
  organization: ElementRef;
  emailError = false;
  querying = false;
  result: boolean;
  currentOrganization: string;
  organizationsList = [];
  isValidOrganization: boolean;
  // array of subscriptions to destroy on component destroy
  subs: Subscription[] = [];

  constructor(private auth: AuthService, private register: RegisterComponent) {}

  ngOnInit() {

  }

  ngAfterViewInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(Observable.fromEvent(this.emailInput.nativeElement, 'input')
      .map(x =>  x['currentTarget'].value)
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
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(Observable.fromEvent(this.organization.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(400)
      .subscribe(val => {
        this.querying = true;
        this.getOrganizations(val);
      })
    );
  }

  getOrganizations(currentOrganization) {
    this.auth.getOrganizations(currentOrganization).then(val => {
        this.querying = false;
        // If no results, destroy results display
        if (!val[0]) {
          this.organizationsList = [];
        } else {
          // Display top 5 matching organizations
          for (let i = 0; i < 5; i++) {
            if (val[i]) {
              this.organizationsList[i] = val[i]['institution'];
            } else {
              // Always display 5 results to cover navigation button.
              this.organizationsList[i] = '';
            }
          }
        }
         // If no query, destroy results display
         if (currentOrganization === '') {
          this.organizationsList = [];
        }
    });
  }

  chooseOrganization(organization: string) {
    // Always display 5 results to cover navigation button.
    // prevent user from clicking on emtpy result.
    if (organization !== '') {
      this.group.controls['organization'].setValue(organization);
      // After org is selected, destroy results display
      this.organizationsList = [];
    }
  }

  ngOnDestroy() {
    // unsubscribe from all observables
    for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }
  }
}
