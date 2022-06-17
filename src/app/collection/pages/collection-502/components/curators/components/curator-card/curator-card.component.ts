import { Component, Input, OnInit } from '@angular/core';
import { UserService } from 'app/core/user.service';

@Component({
  selector: 'clark-502-curator-card',
  templateUrl: './curator-card.component.html',
  styleUrls: ['./curator-card.component.scss']
})
export class CuratorCardComponent implements OnInit {

  @Input() user: {
    'name': string,
    'email': string,
    'profilePic': string
  };

  constructor(
    private userService: UserService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user.profilePic = await this.userService.getGravatarImage(
      this.user.email,
      200,
    );
  }

}
