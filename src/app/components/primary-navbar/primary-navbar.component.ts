import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import * as md5 from 'md5';


@Component({
  selector: 'clark-primary-navbar',
  templateUrl: './primary-navbar.component.html',
  styleUrls: ['./primary-navbar.component.scss']
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
  externalResources = [{content: 'now this is content'}, {content: 'this is also content'}]
  @HostListener('window:resize', ['$event'])

  resizeWindow() {
    this.isDesktop = (window.innerWidth >= 1024) ? true : false;
  }

  constructor(
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.isDesktop = (window.innerWidth >= 1024) ? true : false;
    this.auth.isLoggedIn.subscribe(val => {
      console.log(val);
      this.isLoggedIn = val;
    });
  }

  openMSearch() {
    this.isMSearch = !this.isMSearch;
  }

  openMHamburger() {
    this.isMHamburger = !this.isMHamburger;
  }

  openResources() {
    this.showResources = !this.showResources;
  }

  openTopics() {
    this.showTopics = !this.showTopics;
  }

  openAcademicLevels() {
    this.levelsDropdown = !this.levelsDropdown;
  }

  openUserDropdown() {
    this.userDropdown = !this.userDropdown;
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
