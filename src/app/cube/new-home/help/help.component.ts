import { Component, OnInit } from '@angular/core';

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
    },
    {
      title: 'Build My Cyber Program',
      description: 'I\'m working on designation/accreditation',
      icon: 'fa fa-file-certificate',
      iconColor: 'purple',
    },
    {
      title: 'Explore Collections',
      description: 'I\'m looking for curriculum from a specific collection',
      icon: 'fa fa-users',
      iconColor: 'green',
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
