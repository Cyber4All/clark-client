import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

@Component({
  selector: 'clark-ncyte-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class NcyteDashboardComponent implements OnInit {
  when = 'All-time';
  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });
  email = this.authValidationService.getInputFormControl('email');

  constructor(
    private toaster: ToastrOvenService,
    private view: ViewContainerRef,
    private authValidationService: AuthValidationService
  ) { }

  ngOnInit(): void {
    this.toaster.init(this.view);
  }

  onDownload(): void {
    if(this.email.errors) {
      this.toaster.error('Error!', 'Please fill out the required fields.');
      return;
    }

    if(this.when === 'Date Range' && !this.range.value.start && !this.range.value.end) {
      this.toaster.error('Error!', 'Please enter a date range.');
      return;
    }

    if(this.when === 'All-time') {
      console.log('Email: ', this.email.value);
    } else {
      console.log('Email: ', this.email.value);
      // eslint-disable-next-line max-len
      console.log(`Start Date: ${this.range.value.start.getFullYear()}-${this.range.value.start.getMonth() + 1}-${this.range.value.start.getDate()}`);
      // eslint-disable-next-line max-len
      console.log(`End Date: ${this.range.value.end.getFullYear()}-${this.range.value.end.getMonth() + 1}-${this.range.value.end.getDate()}`);
    }
  }
}
