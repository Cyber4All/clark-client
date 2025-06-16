import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlignmentService } from '../../services/alignment.service';
import { SearchItemDocument } from 'entity/standard-guidelines/search-index';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LearningOutcome } from '@entity';

interface SelectionDocument extends SearchItemDocument {
  checked: boolean;
}

@Component({
  selector: 'clark-guidelines',
  templateUrl: './guidelines.component.html',
  styleUrls: ['./guidelines.component.scss']
})
export class GuidelinesComponent implements OnInit, OnDestroy {

  alignableGuidelines: SelectionDocument[];

  outcomes: LearningOutcome [];
  openOutcome: LearningOutcome;

  private destroy$ = new Subject<void>();

  constructor(
    private alignmentService: AlignmentService
  ) { }

  ngOnInit(): void {
    this.alignmentService.setGuidelinesArray();

    // Subscribe to the source arrays
    this.alignmentService.guidelines$.pipe(takeUntil(this.destroy$)).subscribe((items: any) => {
      this.alignableGuidelines = items;
      this.alignableGuidelines.forEach(item => {
        // If the guideline is already mapping check that sucker off
        if (item.guidelineName === 'fa') {
          item.checked = true;
        } else {
          item.checked = false;
        }
        return item;
      });
      console.log(this.alignableGuidelines);
    });

    this.alignmentService.outcomes$.pipe(takeUntil(this.destroy$)).subscribe((items: any) => {
      this.outcomes = items;

    });
  }

  setOpenOutcome(outcome: LearningOutcome) {
    this.openOutcome = outcome;
    console.log(this.openOutcome);
  }

  addMapping(mappingIdToAdd: string) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
