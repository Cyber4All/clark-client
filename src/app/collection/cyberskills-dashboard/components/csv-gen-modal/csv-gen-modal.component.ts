import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {}

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

  generateCsv(): void {}

  onCancel(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.showModal = false;
    this.closed.emit();
  }
}
