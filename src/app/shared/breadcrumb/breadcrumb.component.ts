import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Params, PRIMARY_OUTLET } from '@angular/router';
import 'rxjs/add/operator/filter';

interface Breadcrumb {
  label: string;
  params: Params;
  url: string;
}

const ROUTE_DATA_BREADCRUMB = 'breadcrumb';

@Component({
  selector: 'breadcrumb',
  template: `
    <ol *ngIf="breadcrumbs.length !== 0" class="breadcrumb">
      <li><a routerLink="./" class="breadcrumb">Home</a></li>
      <li *ngFor="let breadcrumb of breadcrumbs">
        <a [routerLink]="[breadcrumb.url, breadcrumb.params]">{{ breadcrumb.label }}</a>
      </li>
    </ol>
  `
})
export class BreadcrumbComponent implements OnInit {

  isHome = true;
  public breadcrumbs: Breadcrumb[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    // subscribe to the NavigationEnd event
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      // set breadcrumbs
      const root: ActivatedRoute = this.activatedRoute.root;
      this.breadcrumbs = this.getBreadcrumbs(root);
      this.breadcrumbs = this.cleanBreadcrumbs(this.breadcrumbs);
    });
  }
  /**
   * Strips off duplicate routes and returns array of breadcrumbs
   * @method cleanBreadcrumbs
   * @class BreadcrumbComponent
   * @param crumbs
   */
  private cleanBreadcrumbs(crumbs: Breadcrumb[]): Breadcrumb[] {
    for (let i = 1; i < crumbs.length; i++) {
      if (crumbs[i].label === crumbs[i - 1].label) {
        crumbs = crumbs.splice(i);
      }
    }
    return crumbs;
  }

  /**
  * Returns array of Breadcrumb objects that represent the breadcrumb
  *
  * @class BreadcrumbComponent
  * @method getBreadcrumbs
  * @param {ActivateRoute} route
  * @param {string} url
  * @param {Breadcrumb[]} breadcrumbs
  */
  private getBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {

    // get the child routes
    const children: ActivatedRoute[] = route.children;

    // return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // iterate over each children
    for (const child of children) {
      // verify primary route
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      // verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      // get the route's URL segment
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      // append route URL to URL
      url += `./${routeURL}`;

      // add breadcrumb
      const breadcrumb: Breadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        params: child.snapshot.params,
        url: url
      };
      breadcrumbs.push(breadcrumb);

      // recursive
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
  }

}
