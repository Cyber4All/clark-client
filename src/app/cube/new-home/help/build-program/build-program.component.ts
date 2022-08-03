import { Component, OnInit} from '@angular/core';
import { GuidelineService } from 'app/core/guideline.service';
import { BuildProgramComponentService } from 'app/cube/core/build-program-component.service';
import { SearchItemDocument } from 'entity/standard-guidelines/search-index';

@Component({
  selector: 'clark-build-program',
  templateUrl: './build-program.component.html',
  styleUrls: ['./build-program.component.scss']
})
export class BuildProgramComponent implements OnInit {
  currentFramework: string;
  currentFrameworkGuidelines: SearchItemDocument[];

  frameworks = [
    'CAE Cyber Ops',
    'NICE Workforce Tasks',
    'CSTA',
    'CS2013',
    'CSEC',
    'CAE CDE 2019',
    'NICE Workforce Knowledge',
    'APCSP',
    'CAE Cyber Defense',
    'GenCyber-Principles',
    'GenCyber-Concepts',
    'NICE Workforce Abilities',
    'NICE Workforce Skills',
    'CAE-CDE Foundational Knowledge Units',
    'Cyber2yr2020',
  ];

  constructor(private buildProgramComponentService: BuildProgramComponentService,
              private guidelineService: GuidelineService) { }

  ngOnInit(): void {
    this.buildProgramComponentService.currentFrameworkObservable
    .subscribe(framework => {
      this.currentFramework = framework;
    });
  }

  handleFrameworkClicked(event: string) {
    this.buildProgramComponentService.updateCurrentFramework(event);
    this.guidelineService.getGuidelines({
      frameworks: this.currentFramework
    })
    .then(result => {
      this.currentFrameworkGuidelines = result.results;
    });
  }

}
