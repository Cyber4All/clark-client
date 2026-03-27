import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-registration-progress',
  templateUrl: './registration-progress.component.html',
  styleUrls: ['./registration-progress.component.scss']
})
export class RegistrationProgressComponent implements OnInit {

  @Input() index = 1;
  @Input() currentTemp = 'info';
  @Input() showOrganizationStep = false;

  constructor() { }

  ngOnInit(): void {
  }

  isStepActive(step: 'info' | 'organization' | 'account' | 'sso'): boolean {
    const visibleSteps = this.showOrganizationStep
      ? ['info', 'organization', 'account', 'submission', 'sso']
      : ['info', 'account', 'submission', 'sso'];

    const currentStepIndex = visibleSteps.indexOf(this.currentTemp);
    const targetStepIndex = visibleSteps.indexOf(step);

    if (currentStepIndex === -1 || targetStepIndex === -1) {
      return false;
    }

    return currentStepIndex >= targetStepIndex;
  }

}
