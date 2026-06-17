import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
    selector: 'clark-header-502-info',
    templateUrl: './header-info.component.html',
    styleUrls: ['./header-info.component.scss'],
    standalone: true,
    imports: [RouterLink]
})
export class HeaderInfo502Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
