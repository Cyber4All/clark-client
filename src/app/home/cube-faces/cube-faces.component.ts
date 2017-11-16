import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'cube-faces',
  templateUrl: './cube-faces.component.html',
  styleUrls: ['./cube-faces.component.scss']
})
export class CubeFacesComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  
}
