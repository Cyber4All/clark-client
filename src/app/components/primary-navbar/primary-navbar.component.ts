import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { UserService } from 'app/core/user.service';
import { NavbarDropdownService } from 'app/core/navBarDropdown.service';
import { NavbarService } from '../../core/navbar.service';
import { Topic } from '../../../entity';


@Component({
  selector: 'clark-primary-navbar',
  templateUrl: './primary-navbar.component.html',
  styleUrls: ['./primary-navbar.component.scss'],
  providers: [NavbarDropdownService]
})
export class PrimaryNavbarComponent implements OnInit {

  showNav: boolean;
  userDropdown: boolean;
  isLoggedIn: boolean;
  isDesktop: boolean;
  isMSearch: boolean;
  isMHamburger: boolean;
  showTopics: boolean;
  showResources: boolean;
  topics: Topic[];
  resizeThreshold = 1024;
  externalResources: {name: string, link: string}[];
  levelChoice: string;
  // levelsDropdown: boolean;

  @HostListener('window:resize', ['$event'])
  resizeWindow() {
    this.isDesktop = (window.innerWidth >= this.resizeThreshold);
  }

  constructor(
    private auth: AuthService,
    private dropdowns: NavbarDropdownService,
    private userService: UserService,
    private navService: NavbarService
  ) {}

  async ngOnInit(): Promise<void> {
    this.dropdowns.getTopicList();
    this.isDesktop = window.innerWidth >= this.resizeThreshold;
    this.auth.isLoggedIn.subscribe(val => {
      this.isLoggedIn = val;
    });
    this.dropdowns.isMHamburger.subscribe(val => {
      this.isMHamburger = val;
    });
    this.dropdowns.userDropdown.subscribe(val => {
      this.userDropdown = val;
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
    this.dropdowns.showNavbars.subscribe(val => {
      this.showNav = val;
    });
    this.dropdowns.topics.subscribe(val => {
      this.topics = val.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    });
    this.externalResources = this.dropdowns.externalResources;
    this.dropdowns.setNavbarStatus();
    // this.dropdowns.levelsDropdown.subscribe(val => {
    //   this.levelsDropdown = val;
    // });
  }

  gravatarImage(size): string {
    return this.userService.getGravatarImage(this.auth.user.email, size);
  }
}
