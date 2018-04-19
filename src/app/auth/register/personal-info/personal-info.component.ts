import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NgControl, FormGroup, FormControl, Validators} from '@angular/forms';


@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'], 
})

export class PersonalInfoComponent implements OnInit {
  @Input() group: FormGroup;

  constructor() { }

  ngOnInit() {}

}
