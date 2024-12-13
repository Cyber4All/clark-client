import { Component, Input, OnInit } from '@angular/core';
import { UserService } from 'app/core/user-module/user.service';

@Component({
  selector: 'clark-curators',
  templateUrl: './curators.component.html',
  styleUrls: ['./curators.component.scss']
})
export class CuratorsComponent implements OnInit {
  @Input() collectionName: string;
  curators: any;

  constructor(private userService: UserService) { }

  async ngOnInit(): Promise<void> {
    this.curators = await this.userService.searchUsers({
      accessGroups: [`curator@${this.collectionName}`]
    });
  }

}
