import { Component, Input, OnInit } from '@angular/core';
import { GoogleTagService } from 'app/cube/home/google-tag.service';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
    selector: 'clark-help-card',
    templateUrl: './help-card.component.html',
    styleUrls: ['./help-card.component.scss'],
    standalone: true,
    imports: [RouterLink, NgClass]
})
export class HelpCardComponent implements OnInit {

  @Input() option: {title: string, description: string, icon: string, iconColor: string, link?: string[], gtag: string};

  constructor(
    public googleTagService: GoogleTagService
  ) { }

  ngOnInit(): void {
  }

}
