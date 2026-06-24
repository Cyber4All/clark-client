import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'clark-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    standalone: true,
    imports: [RouterLink],
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
