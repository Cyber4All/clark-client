import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-help-back-btn',
  templateUrl: './help-back-btn.component.html',
  styleUrls: ['./help-back-btn.component.scss']
})
export class HelpBackBtnComponent implements OnInit {

  @Input() option: {title: string, description: string, icon: string, iconColor: string};

  @Input() currentFramework: string;

  constructor() { }

  ngOnInit(): void {
  }

}
