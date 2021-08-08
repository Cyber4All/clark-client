import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';
import { RelevancyService } from 'app/core/relevancy.service';

@Component({
  selector: 'clark-relevancy-date',
  templateUrl: './relevancy-date.component.html',
  styleUrls: ['./relevancy-date.component.scss']
})
export class RelevancyDateComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @Output() close: EventEmitter<void> = new EventEmitter();

  selected: Date | null;
  constructor(private relevancyService: RelevancyService) {
    this.selected = new Date();
    this.selected.setFullYear(this.selected.getFullYear() + 1);
   }

  ngOnInit(): void {
  }

  toggleDate(date: any) {
    this.selected = date;
  }

  async setDate() {
    await this.relevancyService.setNextCheckDate(this.learningObject.author.username, this.learningObject.id, this.selected);
    this.close.emit();
  }

  cancelUpdate() {
    this.close.emit();
  }

}
