import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import * as md5 from 'md5';
import { NavbarDropdownService } from '../../core/navBarDropdown.service';


@Component({
  selector: 'clark-primary-navbar',
  templateUrl: './primary-navbar.component.html',
  styleUrls: ['./primary-navbar.component.scss'],
  providers: [NavbarDropdownService]
})
export class PrimaryNavbarComponent implements OnInit {

  levelsDropdown = false;
  userDropdown = false;
  isLoggedIn: boolean;
  isDesktop = false;
  isMSearch = false;
  isMHamburger = false;
  showTopics = false;
  topics = ['topic 1', 'topic 2'];
  showResources = false;
  // @Input()
  externalResources = [{content: 'now this is content'}, {content: 'this is also content'}];
  resizeThreshold = 1024;
  @HostListener('window:resize', ['$event'])

  resizeWindow() {
    this.isDesktop = (window.innerWidth >= this.resizeThreshold) ? true : false;
  }

  constructor(
    private auth: AuthService,
    private dropdowns: NavbarDropdownService
  ) { }

  ngOnInit(): void {
    this.isDesktop = (window.innerWidth >= this.resizeThreshold) ? true : false;
    this.auth.isLoggedIn.subscribe(val => {
      this.isLoggedIn = val;
    });
    this.dropdowns.isMHamburger.subscribe(val => {
      this.isMHamburger = val;
    });
    this.dropdowns.userDropdown.subscribe(val => {
      this.userDropdown = val;
    });
    this.dropdowns.levelsDropdown.subscribe(val => {
      this.levelsDropdown = val;
    });
    this.dropdowns.resourcesDropdown.subscribe(val => {
      this.showResources = val;
    });
    this.dropdowns.isMSearch.subscribe(val => {
      this.isMSearch = val;
    });
    this.dropdowns.topicDropdown.subscribe(val => {
      this.showTopics = val;
    });
  }

  gravatarImage(size): string {
    // r=pg checks the rating of the Gravatar image
    return (
      'https://www.gravatar.com/avatar/' +
      md5(this.auth.user.email) +
      '?s=' +
      size +
      '?r=pg&d=identicon'
    );
  }
}
