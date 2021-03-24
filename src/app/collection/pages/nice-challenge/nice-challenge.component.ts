import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-nice-challenge',
  templateUrl: './nice-challenge.component.html',
  styleUrls: ['./nice-challenge.component.scss']
})
export class NiceChallengeComponent implements OnInit {

  constructor(private navbarService: NavbarService) { }

  ngOnInit(): void {
    this.navbarService.show();
  }

}
