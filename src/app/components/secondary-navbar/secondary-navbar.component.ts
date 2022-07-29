import { Component, HostListener, OnInit } from '@angular/core';
import { NavbarDropdownService } from '../../core/navBarDropdown.service';

@Component({
  selector: 'clark-secondary-navbar',
  templateUrl: './secondary-navbar.component.html',
  styleUrls: ['./secondary-navbar.component.scss'],
  providers: [NavbarDropdownService]
})
export class SecondaryNavbarComponent implements OnInit {

  topicDropdown = false;
  collectionsDropdown = false;
  resourcesDropdown = false;
  isDesktop = false;
  resizeThreshold = 1024;

  topics: string[];
  externalResources: {};
  constructor(
    private dropdowns: NavbarDropdownService
  ) { }

  ngOnInit(): void {
    this.isDesktop = (window.innerWidth >= this.resizeThreshold) ? true : false;
    this.dropdowns.topicDropdown.subscribe(val => {
      this.topicDropdown = val;
    });
    this.dropdowns.collectionsDropdown.subscribe(val => {
      this.collectionsDropdown = val;
    });
    this.dropdowns.resourcesDropdown.subscribe(val => {
      this.resourcesDropdown = val;
    });
    this.topics = this.dropdowns.topics;
    this.externalResources = this.dropdowns.externalResources;
  }

  @HostListener('window:resize', ['$event'])

  resizeWindow() {
    this.isDesktop = window.innerWidth >= this.resizeThreshold;
  }

}
