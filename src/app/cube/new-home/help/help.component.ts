import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  currentFramework: string;
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

  constructor() { }

  ngOnInit(): void {
  }

  selectTemplate(template: number) {
    this.selectedTemplate = template;
  }

  /**
   * Handles communication between child components build-program and help-back-btn
   * to display selected framework, if any.
   *
   * @param event The framework to be passed
   */
  handleEmittedFramework(event: string) {
    this.currentFramework = event;
  }

}
