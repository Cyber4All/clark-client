import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-collection-learning-object-card',
  templateUrl: './collection-learning-object-card.component.html',
  styleUrls: ['./collection-learning-object-card.component.scss']
})
export class CollectionLearningObjectCardComponent implements OnInit {
  @Input() learnObj = new Input();
  shortenedDesc: string;
  constructor() { }

  mobile = false;

  ngOnInit(): void {
    if (window.screen.width < 450) {
      this.mobile = true;
    }

    if(this.learnObj.description){
      this.shortenedDesc = this.truncateHtml(this.learnObj.description);
    }
  }

  truncateHtml(html: string): string {
    if (!html) {
      return html;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    let text = doc.body.textContent || '';

    if (text.length > 70) {
      text = text.substring(0, 70) + '...';
    }

    return text;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.screen.width < 450) { // 768px portrait
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

}
