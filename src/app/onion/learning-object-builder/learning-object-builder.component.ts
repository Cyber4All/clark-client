import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../core/navbar.service';



@Component({
  selector: 'clark-learning-object-builder',
  templateUrl: './learning-object-builder.component.html',
  styleUrls: ['./learning-object-builder.component.scss'],
})
export class LearningObjectBuilderComponent implements OnInit {

  constructor( public nav: NavbarService ) { }

  ngOnInit() {

    // hides clark nav bar from builder
    this.nav.hide();
    console.log(this.nav.visible);
  }

}
