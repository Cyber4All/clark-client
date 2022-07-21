import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-primary-navbar',
  templateUrl: './primary-navbar.component.html',
  styleUrls: ['./primary-navbar.component.scss']
})
export class PrimaryNavbarComponent implements OnInit {

  levelsDropdown = false;
  constructor() { }

  ngOnInit(): void {
  }

  openAcademicLevels() {
    this.levelsDropdown = !this.levelsDropdown;
  }

}
