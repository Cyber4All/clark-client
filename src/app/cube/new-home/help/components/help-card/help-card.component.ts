import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-help-card',
  templateUrl: './help-card.component.html',
  styleUrls: ['./help-card.component.scss']
})
export class HelpCardComponent implements OnInit {

  @Input() option: {title: string, description: string, icon: string, iconColor: string, link?: string[]};

  constructor() { }

  ngOnInit(): void {
  }

}
