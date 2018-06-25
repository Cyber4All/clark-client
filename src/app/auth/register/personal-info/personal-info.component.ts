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
  @ViewChild('organization', { read: ElementRef })
  organization: ElementRef;
  emailError = false;
  querying = false;
  result: boolean;
  currentOrganization: string;
  organizationsList = [];
  isValidOrganization: boolean;
  sub: Subscription;
  sub2: Subscription; // open subscription to close

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
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.sub2 = Observable.fromEvent(this.organization.nativeElement, 'input')
    .map(x => x['currentTarget'].value)
    .debounceTime(400)
    .subscribe(val => {
       this.querying = true;
       this.getOrganizations(val);
    });
  }

  getOrganizations(currentOrganization) {
    this.auth.getOrganizations(currentOrganization).then(val => {
        this.querying = false;
        // Display top 5 matching organizations
        for (let i = 0; i < 5; i++) {
          if (val[i]) {
            this.organizationsList[i] = val[i]['institution'];
          }
        }
    });
  }

  chooseOrganization(organization: string) {
    this.organization.nativeElement.value = organization;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
  }
}
