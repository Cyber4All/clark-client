
import {filter} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { COPY } from './footer.copy';
import { environment } from '@env/environment';

@Component({
  selector: 'cube-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  copy = COPY;
  hideFooter = false;
  pressLive = environment.experimental;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const root: ActivatedRoute = this.route.root;
      this.hideFooter = root.children[0].snapshot.data.hideNavbar;
    });
  }

}
