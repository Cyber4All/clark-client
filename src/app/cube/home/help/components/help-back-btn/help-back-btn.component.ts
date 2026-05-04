import { Component, OnInit, Input } from '@angular/core';
import { BuildProgramComponentService } from 'app/cube/core/build-program-component.service';
import { NgClass, AsyncPipe } from '@angular/common';
import { ActivateDirective } from '../../../../../shared/directives/activate.directive';

@Component({
    selector: 'clark-help-back-btn',
    templateUrl: './help-back-btn.component.html',
    styleUrls: ['./help-back-btn.component.scss'],
    standalone: true,
    imports: [NgClass, ActivateDirective, AsyncPipe]
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

  /**
   * Communicates to other components that the current framework has been deleted
   */
  handleFrameworkClicked() {
    this.buildProgramComponentService.updateCurrentFramework('');
  }

}
