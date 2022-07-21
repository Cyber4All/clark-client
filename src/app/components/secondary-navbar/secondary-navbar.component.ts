import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-secondary-navbar',
  templateUrl: './secondary-navbar.component.html',
  styleUrls: ['./secondary-navbar.component.scss']
})
export class SecondaryNavbarComponent implements OnInit {

  topicDropdown = false;
  collectionsDropdown = false;
  resourcesDropdown = false;
  constructor() { }

  ngOnInit(): void {
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
