import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';
import { RelevancyService } from 'app/core/learning-object-module/relevancy/relevancy.service';

@Component({
  selector: 'clark-relevancy-date',
  templateUrl: './relevancy-date.component.html',
  styleUrls: ['./relevancy-date.component.scss']
})
export class RelevancyDateComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @Output() close: EventEmitter<void> = new EventEmitter();

  minDate: Date;
  maxDate: Date;
  selected: Date;

  constructor(private relevancyService: RelevancyService) { }

  ngOnInit(): void {
    // Set the current nextCheck
    this.selected = new Date(this.learningObject.nextCheck);

    // Set min and maxes for calendar picks
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setMonth(this.minDate.getMonth() + 4);
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 3);
  }

  toggleDate(date: any) {
    this.selected = date;
  }

  async setDate() {
    await this.relevancyService.setNextCheckDate(this.learningObject.author.username, this.learningObject._id, this.selected);
    this.close.emit();
  }

  cancelUpdate() {
    this.close.emit();
  }

}
