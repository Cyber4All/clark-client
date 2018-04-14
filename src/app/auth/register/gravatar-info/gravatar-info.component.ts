import { NgControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@cyber4all/clark-entity';
import * as md5 from 'md5';

@Component({
  selector: 'clark-gravatar-info',
  templateUrl: './gravatar-info.component.html',
  styleUrls: ['./gravatar-info.component.scss']
})
export class GravatarInfoComponent implements OnInit {
  @Input() group: FormGroup;
  @Input() email: String;

  size: number = 200; 
  default: string; /* */ 

  constructor(private auth: AuthService, private route: ActivatedRoute) { 
    this.default = 'identicon';
  }

  ngOnInit() {}

  getGravatarImage():string {
    // r=pg checks the rating of the Gravatar image 
    return 'http://www.gravatar.com/avatar/' + md5(this.email) + '?s=' + this.size + 
      '?r=pg&d=' + this.default;
  }

}
