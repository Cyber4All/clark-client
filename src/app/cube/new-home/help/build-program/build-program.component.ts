import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { GuidelineService } from 'app/core/guideline.service';
import { BuildProgramComponentService } from 'app/cube/core/build-program-component.service';
import { FrameworkDocument } from 'entity/standard-guidelines/Framework';
import { SearchItemDocument } from 'entity/standard-guidelines/search-index';

@Component({
  selector: 'clark-build-program',
  templateUrl: './build-program.component.html',
  styleUrls: ['./build-program.component.scss'],
  animations: [
    trigger('frameworkView', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
          opacity: 0
        }),
        animate('400ms 0ms ease-out', style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          position: 'absolute',
          willChange: 'contents'
        }),
        animate('400ms 0ms ease-out', style({
          willChange: 'contents',
          transform: 'translateX(-100%)',
        }))
      ])
    ]),
    trigger('guidelineView', [
      transition(':enter', [
        style({
          transform: 'translateX(100%)',
          opacity: 0
        }),
        animate('400ms 0ms ease-out', style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          position: 'absolute',
          willChange: 'contents'
        }),
        animate('400ms 0ms ease-out', style({
          willChange: 'contents',
          transform: 'translateX(100%)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class BuildProgramComponent implements OnInit{
  frameworks: FrameworkDocument[];
  currentFramework: string;
  currentFrameworkGuidelines: SearchItemDocument[];

   // separated from currentFrameworkGuidelines for searching
  currentFrameworkGuidelinesFiltered: SearchItemDocument[];

  // separated from currentFrameworkGuidelinesPaginated for maintaining pagination
  currentFrameworkGuidelinesPaginated: SearchItemDocument[][];

  guidelineSearch = ''; // search bar input
  currentPage = 0;

  constructor(private buildProgramComponentService: BuildProgramComponentService,
              private guidelineService: GuidelineService,
              private router: Router) { }

  ngOnInit(): void {
    this.buildProgramComponentService.currentFrameworkObservable
    .subscribe(framework => {
      this.currentFramework = framework;
      this.guidelineSearch = '';
      this.currentFrameworkGuidelines = [];
      this.currentPage = 0;
    });
    this.guidelineService.getFrameworks({ limit: 30, page: 1 })
    .then(result => {
      this.frameworks = result;
    });
  }

  /**
   * When a framework is clicked:
   *  - Updates current framework for other components to view
   *  - Displays the guidelines in paginated format
   *
   * @param event The name of the current framework
   */
  handleFrameworkClicked(event: string) {
    this.buildProgramComponentService.updateCurrentFramework(event);
    this.guidelineService.getGuidelines({
      frameworks: this.currentFramework
    })
    .then(result => {
      this.currentFrameworkGuidelines = result.results
        .sort((a, b) => this.sortGuidelines(a, b));
      this.currentFrameworkGuidelinesFiltered = [...this.currentFrameworkGuidelines];
      this.fillPages();
    });
  }

  /**
   * Helper function for handleFrameworkClicked to sort guidelines by name
   * instead of a random order
   *
   * @param a Comparison element 1
   * @param b Comparison element 2
   * @returns A number determining the relationship between a and b
   */
  sortGuidelines(a: SearchItemDocument, b: SearchItemDocument): 1 | 0 | -1 {
    if(a.guidelineName < b.guidelineName) {
      return -1;
    } else if (a.guidelineName > b.guidelineName) {
      return 1;
    }
    return 0;
  }

  /**
   * Displays guidelines that match what is entered into the search bar
   */
  filterGuidelineSearch() {
    this.currentFrameworkGuidelinesFiltered = this.currentFrameworkGuidelines
      .filter(guideline => {
        return guideline.guidelineName.includes(this.guidelineSearch) || guideline.guidelineDescription.includes(this.guidelineSearch);
      });
    this.currentPage = 0;
    this.fillPages();
  }

  /**
   * Fills the paginated 2D array with arrays of guidelines
   * Subarray lengths are based on the view width (mobile or desktop)
   */
  fillPages() {
    const maxMobileWidth = 425; // the width of a mobile screen

    // Adjusts number of guidelines per page for mobile vs. desktop views
    const numGuidelinesPerPage = window.outerWidth <= maxMobileWidth ? 3 : 6;
    // A 2D array of length equal to total number of pages needed
    const pages = new Array(Math.ceil(this.currentFrameworkGuidelinesFiltered.length / numGuidelinesPerPage));

    // Fills each index of the array with an array of guidelines
    for(let i = 0; i < pages.length; i++) {
      pages[i] = this.currentFrameworkGuidelinesFiltered.slice(i*numGuidelinesPerPage, (i*numGuidelinesPerPage)+numGuidelinesPerPage);
    }
    this.currentFrameworkGuidelinesPaginated = [...pages];
  }

  /**
   * Displays a new page based on what the user clicked on
   *
   * @param index The index of the array to display guidelines
   */
  changePage(index: number) {
    this.currentPage = index;
  }

  /**
   * Routes the user to the browse page
   *
   * @param queryParams: guidelines - the current guideline
   *                     standardOutcomes - the outcomes related to the guideline
   */
  navigate(
    queryParams: {
      guidelines: string,
      standardOutcomes?: string[]
    }
  ) {
    this.currentPage = 0;
    this.buildProgramComponentService.updateCurrentFramework('');
    const params = {
      currPage: 1,
      limit: 10,
      status: [LearningObject.Status.RELEASED],
      guidelines: queryParams.guidelines,
      standardOutcomes: queryParams.standardOutcomes ? queryParams.standardOutcomes : []
    };
    this.router.navigate(['browse'], { queryParams: params });
  }
}
