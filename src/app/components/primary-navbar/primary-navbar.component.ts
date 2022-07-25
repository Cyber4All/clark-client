import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'clark-primary-navbar',
  templateUrl: './primary-navbar.component.html',
  styleUrls: ['./primary-navbar.component.scss']
})
export class PrimaryNavbarComponent implements OnInit {

  levelsDropdown = false;
  userDropdown = false;
  isLoggedIn = false;
  isDesktop = false;

  constructor() { }

  ngOnInit(): void {
    this.isDesktop = (window.innerWidth >= 850) ? true : false;
  }

  @HostListener('window:resize', ['$event'])

  resizeWindow() {
    this.isDesktop = (window.innerWidth >= 850) ? true : false;
  }

  openAcademicLevels() {
    this.levelsDropdown = !this.levelsDropdown;
  }

  openUserDropdown() {
    this.userDropdown = !this.userDropdown;
  }

}
