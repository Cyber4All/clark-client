import { animate, query, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { BuildProgramComponentService } from 'app/cube/core/build-program-component.service';
import { GoogleTagService } from '../google-tag.service';

@Component({
  selector: 'clark-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  animations: [
    trigger('helpCard', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
          opacity: 0
        }),
        animate('500ms 0ms ease-out', style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          position: 'absolute'
        }),
        animate('500ms 0ms ease-out', style({
          transform: 'translateX(-100%)',
          opacity: 0
        }))
      ])
    ]),
    trigger('helpBackButton', [
      transition(':enter', [
        style({
          display: 'inline-block',
          transform: 'translateX(166%)',
          opacity: 0
        }),
        animate('500ms 100ms ease-out', style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          position: 'absolute',
          top: '0'
        }),
        animate('400ms 0ms ease-out', style({
          transform: 'translateX(166%)',
          opacity: 0
        }))
      ])
    ]),
    trigger('helpComponent', [
      transition(':enter', [
        style({
          display: 'inline-block',
          transform: 'translateX(50%)',
          opacity: 0
        }),
        animate('500ms 100ms ease-out', style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          position: 'absolute',
          top: '90px'
        }),
        animate('400ms 0ms ease-out', style({
          transform: 'translateX(50%)',
          opacity: 0
        }))
      ])
    ]),
  ]
})
export class HelpComponent implements OnInit {
  helpOptions = [
    {
      title: 'Teach Something Now',
      description: 'I\'m looking for curriculum on a topic',
      icon: 'fa fa-tag',
      iconColor: 'orange',
      value: 0,
      gtag: 'teach_something_now'
    },
    {
      title: 'Build My Cyber Program',
      description: 'I\'m working on designation/accreditation',
      icon: 'fa fa-file-certificate',
      iconColor: 'purple',
      value: 1,
      gtag: 'build_my_cyber_program'
    },
    {
      title: 'Explore Collections',
      description: 'I\'m looking for curriculum from a specific collection',
      icon: 'fa fa-users',
      iconColor: 'green',
      value: 2,
      link: ['/c'],
      gtag: 'explore_collections'
    },
  ];

  selectedTemplate = -1;

  constructor(
    private buildProgramComponentService: BuildProgramComponentService,
    public googleTagService: GoogleTagService
    ) { }

  ngOnInit(): void {
  }

  selectTemplate(template: number) {
    this.selectedTemplate = template;
  }

  /**
   * Communicates to other components that the current framework has been deleted
   */
  handleFrameworkClicked() {
    this.buildProgramComponentService.updateCurrentFramework('');
  }
}
