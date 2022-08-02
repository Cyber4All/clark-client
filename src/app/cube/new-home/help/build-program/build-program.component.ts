import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-build-program',
  templateUrl: './build-program.component.html',
  styleUrls: ['./build-program.component.scss']
})
export class BuildProgramComponent implements OnInit {

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
