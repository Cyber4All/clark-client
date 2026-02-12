import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthValidationService } from '../../../../core/auth-module/auth-validation.service';
import { ReportService } from '../../../../core/report-module/report.service';
import { ToastrOvenService } from '../../../../shared/modules/toaster/notification.service';

@Component({
  selector: 'clark-ncyte-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class NcyteDashboardComponent implements OnInit {
  range = new UntypedFormGroup({
    start: new UntypedFormControl(null),
    end: new UntypedFormControl(null),
  });
  name: UntypedFormControl;

  constructor(
    private toaster: ToastrOvenService,
    private view: ViewContainerRef,
    private authValidationService: AuthValidationService,
    private reportService: ReportService,
  ) {
    this.name = this.authValidationService.getInputFormControl('text');
  }

  ngOnInit(): void {
    this.toaster.init(this.view);
  }

  onDownload(): void {
    if (!this.range.value.start && !this.range.value.end) {
      this.toaster.error('Error!', 'Please enter a date range.');
      return;
    }

    const start = `${this.range.value.start.getFullYear()}-${this.range.value.start.getMonth() + 1}-${this.range.value.start.getDate()}`;
    const end = `${this.range.value.end.getFullYear()}-${this.range.value.end.getMonth() + 1}-${this.range.value.end.getDate()}`;

    this.reportService.generateCollectionReport(['ncyte'], this.name.value, { start: start, end: end });
    this.toaster.alert('We\'re working on it!', 'Please wait while we generate the report.');
  }
}
