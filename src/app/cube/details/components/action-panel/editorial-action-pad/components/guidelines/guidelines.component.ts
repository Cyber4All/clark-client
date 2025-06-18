import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AlignmentService } from '../../services/alignment.service';
import { SearchItem, SearchItemDocument } from 'entity/standard-guidelines/search-index';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LearningOutcome } from '@entity';

interface SelectionDocument extends SearchItemDocument {
  checked: boolean;
}

@Component({
  selector: 'clark-guidelines',
  templateUrl: './guidelines.component.html',
  styleUrls: ['./guidelines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidelinesComponent implements OnInit, OnDestroy {

  alignableGuidelines: SelectionDocument[];

  outcomes: LearningOutcome [];
  openOutcome: LearningOutcome;

  private destroy$ = new Subject<void>();

  constructor(
    private alignmentService: AlignmentService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.alignmentService.setGuidelinesArray();

    // Subscribe to the source arrays
    this.alignmentService.guidelines$.pipe(takeUntil(this.destroy$)).subscribe((items: any) => {
      this.alignableGuidelines = items;
    });

    this.alignmentService.outcomes$.pipe(takeUntil(this.destroy$)).subscribe((items: any) => {
      this.outcomes = items;
    });
  }

  setOpenOutcome(outcome: LearningOutcome) {
    if(outcome.id) {
      this.openOutcome = outcome;
      const outcomeMappings = outcome.mappings.map(mapping => mapping.guidelineName);
      this.alignableGuidelines.forEach(item => {
        // If the guideline is already mapping check that sucker off
        if (outcomeMappings.includes(item.guidelineName)) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        return item;
      });
    } else {
      // We closed an outcome without opening a new one so remove the selected mappings
      this.alignableGuidelines.forEach(item => {
          item.checked = false;
        return item;
      });
    }
  }

  addMapping(mappingToAdd: any) {
    const updatedOutcome = this.openOutcome;
    const currentMappings = this.openOutcome.mappings.map(map => map.id);

    mappingToAdd.id = mappingToAdd.guidelineId;
    const index = currentMappings.indexOf(mappingToAdd.id);

    let outcomes = this.outcomes;
    if (index > -1) {
      updatedOutcome.mappings.splice(index, 1); // removes 1 item at the found index
    } else {
      updatedOutcome.mappings.push(mappingToAdd);
    }

    outcomes = this.outcomes.map(outcome => outcome.id === this.openOutcome.id ? updatedOutcome : outcome);
    this.alignmentService.setOutcomes(outcomes);
    this.ref.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
