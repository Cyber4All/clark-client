import { LearningObjectService } from './learning-object.service';
import { Component, OnInit } from '@angular/core';
import { ModalService, Position, ModalListElement } from 'clark-modal';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  hideTopbar: any = false;
  constructor(private router: Router, private route: ActivatedRoute) { }
  ngOnInit() {
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      let root: ActivatedRoute = this.route.root;
      this.hideTopbar = root.children[0].snapshot.data.hideTopbar;
    });
  }
}
