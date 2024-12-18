import { Component, OnInit } from '@angular/core';
import { GoogleTagService } from '../google-tag.service';
import { UtilityService } from '../../../core/utility-module/utility.service';
import { SearchService } from '../../../core/learning-object-module/search/search.service';

@Component({
  selector: 'clark-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  numReleasedObjects = 0; // default number of released objects before the service provides a new number
  resourceCount = 0; // default number of resources before the service provides a new number
  constructor(
    public googleTagService: GoogleTagService,
    public utilityService: UtilityService,
    public learningObjectService: SearchService
    ) { }

  async ngOnInit(): Promise<void> {
    this.learningObjectService.getLearningObjects({'status': ['released']}).then(stats => {
      this.numReleasedObjects = Math.floor(stats.total / 10) * 10;
    });
    await this.utilityService.getAllResources().then((res: any) => {
      this.resourceCount = Math.floor(res.total / 10) * 10;
    });
  }
}
