import { Component, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'clark-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss']
})
export class MaintenancePageComponent implements AfterViewInit {

  cogs: any[];

  @HostListener('window:resize') resizeHandler() {
    this.countCogs()
  }

  constructor() { }

  ngAfterViewInit() {
    this.countCogs();
  }

  countCogs() {
    // each cog is 125 pixels wide
    const windowWidth = window.innerWidth;
    this.cogs = new Array(Math.ceil(windowWidth / 125) + 2);
  }

}
