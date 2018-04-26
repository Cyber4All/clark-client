import { NgControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@cyber4all/clark-entity';
import * as md5 from 'md5';
import { Observable } from 'rxjs/Observable';
import { RegisterComponent } from '../../register/register.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'clark-gravatar-info',
  templateUrl: './gravatar-info.component.html',
  styleUrls: ['./gravatar-info.component.scss']
})
export class GravatarInfoComponent implements OnInit, OnDestroy {
  @Input() group: FormGroup;
  @Input() email: String;
  @ViewChild('emailInput', { read: ElementRef })
  emailInput: ElementRef;
  result: boolean;
  sub: Subscription;

  size = 200;
  default: string;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private register: RegisterComponent
  ) {
    this.default = 'identicon';
  }

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

  getGravatarImage(): string {
    // r=pg checks the rating of the Gravatar image
    return (
      'https://www.gravatar.com/avatar/' +
      md5(this.email) +
      '?s=' +
      this.size +
      '?r=pg&d=' +
      this.default
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
