import { Component, OnInit, Input, HostListener } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user-module/user.service';
import { Users } from 'aws-sdk/clients/workmail';
import { titleCase } from 'title-case';

@Component({
  selector: 'clark-curator-card',
  templateUrl: './curator-card.component.html',
  styleUrls: ['./curator-card.component.scss']
})
export class CuratorCardComponent implements OnInit {

  // users array, not recognizing email property, so using any
  @Input() curator: any;
  profileImg: string | undefined;
  mobile: boolean;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.profileImg = this.userService.getGravatarImage(this.curator.email, 100);

    if (window.screen.width < 450) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

  /**
   * Function to conditionally set the title case of an organization
   *
   * @param organization string of the users affiliated organization
   * @returns string unformated or title cased
   */
  organizationFormat(organization: string) {
    if ( organization.charAt(1) === organization.charAt(1).toUpperCase() ) {
      return organization;
    } else {
      return titleCase(organization);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.screen.width < 450) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

}
