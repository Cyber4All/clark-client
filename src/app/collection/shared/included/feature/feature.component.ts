import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {
  @Input() collectionName: string;
  constructor() { }

  ngOnInit(): void {

  }

}
