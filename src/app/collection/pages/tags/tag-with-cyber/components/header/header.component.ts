import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TAGS_ROUTES } from 'app/core/learning-object-module/tags/tags.routes';

type TagsResponse = {
  tags: { _id: string }[];
  total: number;
};

@Component({
  selector: 'clark-with-cyber-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderWithCyberComponent {

  @Input() collectionAbv: string;
  isUserAuthorized = false;
  constructor(private router: Router) {}

  async navigateToBrowse() {
    const tag = await this.getCorrectTag();
    this.router.navigate(['/browse'], { queryParams : {currPage: 1, tags: tag} });
  }
 async getCorrectTag() {
  const url =  TAGS_ROUTES.GET_ALL_TAGS({ text: "WITHCyber" });
  console.log("url: ",url);
  const res = await fetch(url, { method: "GET" });
  const data: TagsResponse = await res.json();
 
  const tagid =  data.tags?.[0]?._id ?? null;
  console.log("tagID: ",tagid);
  return tagid; 
}
   
}


