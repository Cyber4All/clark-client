import { Component, OnInit } from '@angular/core';
import { BuildProgramComponentService } from 'app/cube/core/build-program-component.service';

@Component({
  selector: 'clark-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  helpOptions = [
    {
      title: 'Teach Something Now',
      description: 'I\'m looking for curriculum on a topic',
      icon: 'fa fa-tag',
      iconColor: 'orange',
      value: 0,
    },
    {
      title: 'Build My Cyber Program',
      description: 'I\'m working on designation/accreditation',
      icon: 'fa fa-file-certificate',
      iconColor: 'purple',
      value: 1,
    },
    {
      title: 'Explore Collections',
      description: 'I\'m looking for curriculum from a specific collection',
      icon: 'fa fa-users',
      iconColor: 'green',
      value: 2,
    },
  ];

  selectedTemplate = -1;

  constructor(private buildProgramComponentService: BuildProgramComponentService) { }

  ngOnInit(): void {
  }

  selectTemplate(template: number) {
    this.selectedTemplate = template;
  }

  handleFrameworkClicked() {
    this.buildProgramComponentService.updateCurrentFramework('');
  }
}
