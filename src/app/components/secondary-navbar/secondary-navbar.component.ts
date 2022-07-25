import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'clark-secondary-navbar',
  templateUrl: './secondary-navbar.component.html',
  styleUrls: ['./secondary-navbar.component.scss']
})
export class SecondaryNavbarComponent implements OnInit {

  topicDropdown = false;
  collectionsDropdown = false;
  resourcesDropdown = false;
  isDesktop = false;
  constructor() { }

  ngOnInit(): void {
    this.isDesktop = (window.innerWidth >= 850) ? true : false;
  }

  @HostListener('window:resize', ['$event'])

  resizeWindow() {
    this.isDesktop = (window.innerWidth >= 850) ? true : false;
  }

  openTopics() {
    this.topicDropdown = !this.topicDropdown;
  }

  openCollections() {
    this.collectionsDropdown = !this.collectionsDropdown;
  }

  openResources() {
    this.resourcesDropdown = !this.resourcesDropdown;
  }

}
