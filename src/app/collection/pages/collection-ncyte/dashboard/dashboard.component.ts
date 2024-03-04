import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { AuthValidationService } from 'app/core/auth-module/auth-validation.service';
import { CollectionService } from 'app/core/collection-module/collections.service';
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
  name = this.authValidationService.getInputFormControl('text');

  constructor(
    private toaster: ToastrOvenService,
    private view: ViewContainerRef,
    private authValidationService: AuthValidationService,
    private collectionService: CollectionService
  ) { }

  ngOnInit(): void {
    this.toaster.init(this.view);
  }

  onDownload(): void {
    if (this.email.errors || this.name.errors) {
      this.toaster.error('Error!', 'Please fill out the required fields.');
      return;
    }

    if (this.when === 'Date Range' && !this.range.value.start && !this.range.value.end) {
      this.toaster.error('Error!', 'Please enter a date range.');
      return;
    }

    if (this.when === 'All-time') {
      this.collectionService.generateCollectionReport(['ncyte'], this.email.value, this.name.value);
    } else {
      const start = `${this.range.value.start.getFullYear()}-${this.range.value.start.getMonth() + 1}-${this.range.value.start.getDate()}`;
      const end = `${this.range.value.end.getFullYear()}-${this.range.value.end.getMonth() + 1}-${this.range.value.end.getDate()}`;
      this.collectionService.generateCollectionReport(['ncyte'], this.email.value, this.name.value, { start: start, end: end });
    }

    this.toaster.alert('We\'re working on it!', 'Please check your email in a few minutes for your report.');
  }
}
