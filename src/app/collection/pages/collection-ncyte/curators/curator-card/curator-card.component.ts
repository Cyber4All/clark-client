import { Component, OnInit, Input } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user.service';

@Component({
  selector: 'clark-curator-card',
  templateUrl: './curator-card.component.html',
  styleUrls: ['./curator-card.component.scss']
})
export class CuratorCardComponent implements OnInit {

  @Input() curator: any;
  profileImg: string | undefined;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    console.log(this.curator);
    this.profileImg = this.userService.getGravatarImage(this.curator.email, 100);
  }

}
