import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';
@Component({
  selector: 'clark-with-cyber-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderWithCyberComponent {

  @Input() collectionAbv: string;
  isUserAuthorized = false;
  constructor(
    private router: Router,
    private tagsService: TagsService
  ) {}

  async navigateToBrowse() {
    const tag = await this.tagsService.getTagIdByName('WITHcyber');
    this.router.navigate(['/browse'], { queryParams : {currPage: 1, tags: tag} });
  }
}
