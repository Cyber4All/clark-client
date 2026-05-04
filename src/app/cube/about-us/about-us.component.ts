import { Component, OnInit } from '@angular/core';
import { MissionComponent } from './components/mission/mission.component';
import { AboutClarkComponent } from './components/about-clark/about-clark.component';
import { TimelineComponent } from './components/timeline/timeline.component';

@Component({
    selector: 'clark-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss'],
    standalone: true,
    imports: [MissionComponent, AboutClarkComponent, TimelineComponent]
})
export class AboutUsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
