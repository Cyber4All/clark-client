import { Component, HostListener, OnInit } from '@angular/core';
import { Topic } from '../../../entity';
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

  showNav: boolean;
  topics: Topic[];
  externalResources: {};
  constructor(
    private dropdowns: NavbarDropdownService
  ) { }

  async ngOnInit(): Promise<void> {
    this.dropdowns.getTopicList();
    this.isDesktop = (window.innerWidth >= this.resizeThreshold);
    this.dropdowns.topicDropdown.subscribe(val => {
      this.topicDropdown = val;
    });
    this.dropdowns.collectionsDropdown.subscribe(val => {
      this.collectionsDropdown = val;
    });
    this.dropdowns.resourcesDropdown.subscribe(val => {
      this.resourcesDropdown = val;
    });
    this.dropdowns.showNavbars.subscribe(val => {
      this.showNav = val;
    });
    this.dropdowns.topics.subscribe(val => {
      this.topics = val;
    });
    this.externalResources = this.dropdowns.externalResources;
    this.dropdowns.setNavbarStatus();
  }

  @HostListener('window:resize', ['$event'])
  resizeWindow() {
    this.isDesktop = window.innerWidth >= this.resizeThreshold;
  }

}
