import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'cube-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  hideFooter = false;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      const root: ActivatedRoute = this.route.root;
      this.hideFooter = root.children[0].snapshot.data.hideNavbar;
    });
  }

}
