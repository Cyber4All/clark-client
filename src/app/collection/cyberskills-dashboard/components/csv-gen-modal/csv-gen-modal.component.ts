import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ReportService } from '../../../../core/report-module/report.service';
import { ToastrOvenService } from '../../../../shared/modules/toaster/notification.service';

@Component({
  selector: 'clark-csv-gen-modal',
  templateUrl: './csv-gen-modal.component.html',
  styleUrls: ['./csv-gen-modal.component.scss'],
})
export class CsvGenModalComponent implements OnInit {
  @Output() generateCSV = new EventEmitter<{ start: Date; end: Date }>();
  @Output() closed = new EventEmitter<void>();

  range: FormGroup;
  filterSelected = false;
  showModal = true;

  constructor(
    private fb: FormBuilder,
    private toaster: ToastrOvenService,
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    this.range = this.fb.group({
      start: [null],
      end: [null],
    });
  }

  clearDates(): void {
    this.range.reset();
    this.filterSelected = false;
  }

  onDownload(): void {
    if (!this.range.value.start && !this.range.value.end) {
      this.toaster.error('Error!', 'Please enter a date range.');
      return;
    }

    const start = `${this.range.value.start.getFullYear()}-${this.range.value.start.getMonth() + 1}-${this.range.value.start.getDate()}`;
    const end = `${this.range.value.end.getFullYear()}-${this.range.value.end.getMonth() + 1}-${this.range.value.end.getDate()}`;

    this.reportService.generateCollectionReport(
      ['cyberskills2work'],
      `cyberskills2work_from_${start}_to_${end}`,
      {
        start: start,
        end: end,
      },
    );

    this.toaster.alert(
      'We\'re working on it!',
      'Please wait while we generate the report.',
    );
  }

  onCancel(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.showModal = false;
    this.closed.emit();
  }
}
