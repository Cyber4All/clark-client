import { Component, OnInit, Input } from '@angular/core';
import { BuildProgramComponentService } from 'app/cube/core/build-program-component.service';

@Component({
  selector: 'clark-help-back-btn',
  templateUrl: './help-back-btn.component.html',
  styleUrls: ['./help-back-btn.component.scss']
})
export class HelpBackBtnComponent implements OnInit {

  @Input() option: {title: string, description: string, icon: string, iconColor: string};

  currentFramework: string;

  constructor(public buildProgramComponentService: BuildProgramComponentService) { }

  ngOnInit(): void {
    this.buildProgramComponentService.currentFrameworkObservable
    .subscribe(framework => {
      this.currentFramework = framework;
    });
  }

  handleFrameworkClicked() {
    this.buildProgramComponentService.updateCurrentFramework('');
  }

}
