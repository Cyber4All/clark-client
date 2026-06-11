import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'clark-redirect',
    templateUrl: './redirect.component.html',
    styleUrls: ['./redirect.component.scss'],
    standalone: true,
    imports: [RouterLink]
})
export class RedirectComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
