import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-collection-learning-object-card',
  templateUrl: './collection-learning-object-card.component.html',
  styleUrls: ['./collection-learning-object-card.component.scss']
})
export class CollectionLearningObjectCardComponent implements OnInit {
  @Input() learnObj = new Input();
  constructor() { }

  mobile = false;

  ngOnInit(): void {
    if (window.screen.width < 400) { // 768px portrait
      this.mobile = true;
    }

    console.log(this.mobile);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.screen.width < 400) { // 768px portrait
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    console.log(this.mobile);
  }

}
