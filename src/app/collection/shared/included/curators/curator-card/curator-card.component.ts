import { Component, OnInit, Input } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user.service';
import { Users } from 'aws-sdk/clients/workmail';

@Component({
  selector: 'clark-curator-card',
  templateUrl: './curator-card.component.html',
  styleUrls: ['./curator-card.component.scss']
})
export class CuratorCardComponent implements OnInit {

  // users array, not recognizing email property, so using any
  @Input() curator: any;
  profileImg: string | undefined;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.profileImg = this.userService.getGravatarImage(this.curator.email, 100);
  }

}
