import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthValidationService } from '../../../../core/auth-module/auth-validation.service';
import { ReportService } from '../../../../core/report-module/report.service';
import { ToastrOvenService } from '../../../../shared/modules/toaster/notification.service';

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
  name = this.authValidationService.getInputFormControl('text');

  constructor(
    private toaster: ToastrOvenService,
    private view: ViewContainerRef,
    private authValidationService: AuthValidationService,
    private reportService: ReportService,
  ) { }

  ngOnInit(): void {
    this.toaster.init(this.view);
  }

  onDownload(): void {

    if (this.when === 'Date Range' && !this.range.value.start && !this.range.value.end) {
      this.toaster.error('Error!', 'Please enter a date range.');
      return;
    }

    if (this.when === 'All-time') {
      this.reportService.generateCollectionReport(['ncyte'], this.name.value);
    } else {
      const start = `${this.range.value.start.getFullYear()}-${this.range.value.start.getMonth() + 1}-${this.range.value.start.getDate()}`;
      const end = `${this.range.value.end.getFullYear()}-${this.range.value.end.getMonth() + 1}-${this.range.value.end.getDate()}`;
      this.reportService.generateCollectionReport(['ncyte'], this.name.value, { start: start, end: end });
    }

    this.toaster.alert('We\'re working on it!', 'Please check your email in a few minutes for your report.');
  }
}
