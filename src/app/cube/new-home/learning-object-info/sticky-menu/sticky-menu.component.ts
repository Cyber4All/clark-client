import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'clark-sticky-menu',
  templateUrl: './sticky-menu.component.html',
  styleUrls: ['./sticky-menu.component.scss']
})
export class StickyMenuComponent implements OnInit {
  hasBeenClicked = {
    learningObjects: false,
    learningOutcomes: false,
    hierarchies: false,
    collections: false,
  };
  isMobileView = false;
  responsiveThreshold = 800; 
  windowWidth: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // console.log(event.target.innerWidth)
    this.isMobileView = this.responsiveThreshold > event.target.innerWidth;
  }

  async click(choice: string) {
    this.setFieldsToFalse();
    switch(choice) {
      case "learningObject":
        this.hasBeenClicked.learningObjects = true;
        await this.router.navigateByUrl("/home#learning-object")
        break;
      case "learningOutcome":
        this.hasBeenClicked.learningOutcomes = true;
        await this.router.navigateByUrl("/home#learning-outcomes")
        break;
      case "hierarchies":
        this.hasBeenClicked.hierarchies = true;
        await this.router.navigateByUrl("/home#hierarchies")
        break;
      case "collections":
        this.hasBeenClicked.collections = true;
        await this.router.navigateByUrl("/home#collections")
        break;
    }
  }

  setFieldsToFalse() {
    this.hasBeenClicked.collections = false;
    this.hasBeenClicked.hierarchies = false;
    this.hasBeenClicked.learningObjects = false;
    this.hasBeenClicked.learningOutcomes = false;
  }

  isOtherChoiceSelected() {
    return Object.values(this.hasBeenClicked).every((isSelected) => !isSelected);
  }
}
