import { Component, OnInit} from '@angular/core';
import { GuidelineService } from 'app/core/guideline.service';
import { BuildProgramComponentService } from 'app/cube/core/build-program-component.service';
import { FrameworkDocument } from 'entity/standard-guidelines/Framework';
import { SearchItemDocument } from 'entity/standard-guidelines/search-index';

@Component({
  selector: 'clark-build-program',
  templateUrl: './build-program.component.html',
  styleUrls: ['./build-program.component.scss']
})
export class BuildProgramComponent implements OnInit {
  frameworks: FrameworkDocument[];
  currentFramework: string;
  currentFrameworkGuidelines: SearchItemDocument[];
  currentFrameworkGuidelinesFiltered: SearchItemDocument[];
  currentFrameworkGuidelinesPaginated: SearchItemDocument[][];

  guidelineSearch = '';
  currentPage = 0;

  constructor(private buildProgramComponentService: BuildProgramComponentService,
              private guidelineService: GuidelineService) { }

  ngOnInit(): void {
    this.buildProgramComponentService.currentFrameworkObservable
    .subscribe(framework => {
      this.currentFramework = framework;
      this.guidelineSearch = '';
      this.currentFrameworkGuidelines = [];
      this.currentPage = 0;
    });
    this.guidelineService.getFrameworks({ limit: 100, page: 1 })
    .then(result => {
      this.frameworks = result;
    });
  }

  removeGuidelineSearch() {
    this.guidelineSearch = '';
  }
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

  sortGuidelines(a: SearchItemDocument, b: SearchItemDocument): 1 | 0 | -1 {
    if(a.guidelineName < b.guidelineName) {
      return -1;
    } else if (a.guidelineName > b.guidelineName) {
      return 1;
    }
    return 0;
  }

  fillPages() {
    const pages = new Array(Math.ceil(this.currentFrameworkGuidelinesFiltered.length / 6));

    for(let i = 0; i < pages.length; i++) {
      pages[i] = this.currentFrameworkGuidelinesFiltered.slice(i*6, (i*6)+6);
    }
    this.currentFrameworkGuidelinesPaginated = [...pages];
  }

  changePage(index: number) {
    this.currentPage = index;
  }

  filterGuidelineSearch() {
    this.currentFrameworkGuidelinesFiltered = this.currentFrameworkGuidelines
      .filter(guideline => {
        return guideline.guidelineName.includes(this.guidelineSearch) || guideline.guidelineDescription.includes(this.guidelineSearch);
      });
    this.fillPages();
  }
}
