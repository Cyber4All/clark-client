import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-cyberskills-card',
  templateUrl: './cyberskills-card.component.html',
  styleUrls: ['./cyberskills-card.component.scss']
})
export class CyberskillsCardComponent implements OnInit {
  @Input() learningObject: any;
  @Input() statusDescription: string = ''; 

  constructor() { }

  ngOnInit(): void { }
}
