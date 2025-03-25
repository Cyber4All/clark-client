import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'clark-xp-cyber',
  templateUrl: './xp-cyber.component.html',
  styleUrls: ['./xp-cyber.component.scss']
})
export class XPCyberComponent implements OnInit {

  constructor(
    private navbarService: NavbarService,
    private titleService: Title) { }

  ngOnInit(): void {
    this.navbarService.show();

    this.titleService.setTitle('CLARK | XP Cyber');
  }

}
