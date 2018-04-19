import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NgControl, FormGroup, FormControl, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'clark-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'], 
})
export class ProfileInfoComponent implements OnInit {
  @Input() group: FormGroup;

  constructor() {}

  ngOnInit() {}

}
