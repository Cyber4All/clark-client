import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/core/navbar.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'clark-nice-challenge',
  templateUrl: './nice-challenge.component.html',
  styleUrls: ['./nice-challenge.component.scss']
})
export class NiceChallengeComponent implements OnInit {

  constructor(
    private navbarService: NavbarService,
    private titleService: Title) { }

  ngOnInit(): void {
    this.navbarService.show();

    this.titleService.setTitle('CLARK | NICE Challenge');
  }

}
