import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Input,
} from '@angular/core';
import { AlignmentService } from '../../services/alignment.service';
import { SearchItemDocument } from 'entity/standard-guidelines/search-index';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LearningOutcome, LearningObject } from '@entity';
import { GuidelineService } from 'app/core/standard-guidelines-module/standard-guidelines.service';
import { stripHtmlTags } from 'app/shared/functions/StripHTML';
import { selectedGuidelines } from './guidelines_data';

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
  @Input() learningObject: LearningObject;
  alignableGuidelines: SelectionDocument[];

  outcomes: LearningOutcome[];
  openOutcome: LearningOutcome;
  // Keep track of opened material expansion panels

  // First outcome is expanded by default
  openPanelIndex = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private alignmentService: AlignmentService,
    private guidelineService: GuidelineService,
    private ref: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    const learningObjectData = [
      this.learningObject.name,
      this.learningObject.description,
      // Combine outcomes text
      ...(this.learningObject.outcomes?.map((o) => o.text) || []),
    ].join(' ');
    const filter = {
      text: stripHtmlTags(learningObjectData),
    };
    // Get a list of suggested guidelines based on the learning object data
    const result = await this.guidelineService.getGuidelines(filter);
    if (result.results.length === 0) {
      // Use the hard coded 8 core KSATs when there are no results
      this.alignmentService.setGuidelinesArray(
        selectedGuidelines as SearchItemDocument[],
      );
    } else {
      this.alignmentService.setGuidelinesArray(result.results);
    }

    // Subscribe to the source arrays
    this.alignmentService.guidelines$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items: any) => {
        this.alignableGuidelines = items;
        this.ref.markForCheck();
      });

    this.alignmentService.outcomes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items: any) => {
        this.outcomes = items;
        this.ref.markForCheck();
      });
  }

  setOpenOutcome(outcome: LearningOutcome, index: number) {
    this.openPanelIndex = index;
    if (outcome) {
      this.openOutcome = outcome;
      const outcomeMappings = outcome.mappings.map(
        (mapping) => mapping.guidelineName,
      );
      this.alignableGuidelines.forEach((item) => {
        // If the guideline is already mapping check that sucker off
        item.checked = outcomeMappings.includes(item.guidelineName);
        this.ref.markForCheck();
      });
    } else {
      this.openOutcome = null;
      // We closed an outcome without opening a new one so remove the selected mappings
      this.alignableGuidelines.forEach((item) => {
        item.checked = false;
      });
      this.ref.markForCheck();
    }
  }

  onToggleMapping(event) {
    this.addMapping({ ...event.standardOutcome });
  }

  removeMapping(mappingToRemove: any, outcome: LearningOutcome) {
    const index = outcome.mappings.findIndex(
      (m) => m.id === mappingToRemove.id,
    );
    if (index > -1) {
      outcome.mappings.splice(index, 1);
      const updatedOutcomes = this.outcomes.map((o) =>
        o.id === outcome.id ? outcome : o,
      );
      this.alignmentService.setOutcomes(updatedOutcomes);
      this.ref.markForCheck();
    }
  }

  addMapping(mappingToAdd: any) {
    const updatedOutcome = this.openOutcome;
    const currentMappings = this.openOutcome.mappings.map((map) => map.id);

    mappingToAdd.id = mappingToAdd.guidelineId;
    const index = currentMappings.indexOf(mappingToAdd.id);

    let outcomes = this.outcomes;
    if (index > -1) {
      updatedOutcome.mappings.splice(index, 1); // removes 1 item at the found index
    } else {
      updatedOutcome.mappings.push(mappingToAdd);
    }

    outcomes = this.outcomes.map((outcome) =>
      outcome.id === this.openOutcome.id ? updatedOutcome : outcome,
    );
    this.alignmentService.setOutcomes(outcomes);
    this.ref.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
