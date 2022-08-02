import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'clark-build-program',
  templateUrl: './build-program.component.html',
  styleUrls: ['./build-program.component.scss']
})
export class BuildProgramComponent implements OnInit {
  currentFramework: string;

  // emits to HelpBackBtn to display current framework being queried
  @Output() emitFramework = new EventEmitter<string>();

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

  constructor() { }

  ngOnInit(): void {
  }

}
