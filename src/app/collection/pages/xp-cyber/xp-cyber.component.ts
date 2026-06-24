import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { Title } from '@angular/platform-browser';
import { HeaderComponent } from './components/header/header.component';
import { FeatureComponent } from '../../shared/included/feature/feature.component';
import { PhilosophyComponent } from './components/philosophy/philosophy.component';
import { CuratorsComponent } from '../../shared/included/curators/curators.component';
import { StatsComponent } from '../../shared/included/stats/stats.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
    selector: 'clark-xp-cyber',
    templateUrl: './xp-cyber.component.html',
    styleUrls: ['./xp-cyber.component.scss'],
    standalone: true,
    imports: [HeaderComponent, FeatureComponent, PhilosophyComponent, CuratorsComponent, StatsComponent, FooterComponent]
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
