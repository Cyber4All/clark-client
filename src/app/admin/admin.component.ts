import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from 'app/core/navbar.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { takeUntil, skipWhile, take, filter, map, switchMap } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { CollectionService, Collection } from 'app/core/collection.service';
import { ToasterService } from 'app/shared/shared modules/toaster';


@Component({
  selector: 'clark-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject();

  authorizedCollections: Collection[] = [];
  activeCollection: string;

  editorMode: boolean;

  canScroll = true;

  collectionsLoaded: boolean;

  constructor(
    private navbarService: NavbarService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private collectionService: CollectionService,
    public toaster: ToasterService
  ) {}

  ngOnInit() {
    // hide CLARK navbar
    this.navbarService.hide();

    // set the can scroll value to determine whether or not we add 30px of padding to the bottom of the content wrapper
    const canScroll = this.route.snapshot.firstChild.data.canScroll;
    this.canScroll = typeof canScroll === 'boolean' ? canScroll : true;

    // listen for route changes to perform the same check above
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.route),
      map(route => route.firstChild),
      switchMap(route => route.data),
    ).subscribe(data =>  {
      this.canScroll = typeof data.canScroll === 'boolean' ? data.canScroll : true;
    });

    if (this.authService.hasEditorAccess()) {
      this.editorMode = true;
      // we don't need to load collections, so we can set that initialization block to true
      this.collectionsLoaded = true;
    } else {
      // this user isn't an admin/editor so fetch the route parameter representing the selected collection
      this.route.paramMap
        .pipe(takeUntil(this.destroyed$))
        .subscribe(params => {
          // we don't need to authorize here since that's done in the route guard
          this.activeCollection = params.get('collection');
        });

      // wait for user to be logged in (edge case: slow connections can cause the application to
      // temporarily load in an unauthenticated state) and then fetch list of curated collections
      this.retrieveAuthorizedCollectionsAfterLogin().then(() => {
        // collections array is now set and we should redirect to the first collection
        if (!this.activeCollection) {
          this.router.navigate([this.authorizedCollections[0].abvName], { relativeTo: this.route });
        }
      }).catch(error => {
        this.toaster.notify('Error!', 'There was an error retrieving collections. Please try again later.', 'bad', 'far fa-times');
        console.error(error);
      });
    }
  }

  /**
   * Wait for the login event to fire to ensure an authenticated state and then call the retrieveAuthorizedCollections function
   *
   * @returns
   * @memberof AdminComponent
   */
  async retrieveAuthorizedCollectionsAfterLogin() {
    return await this.authService.isLoggedIn.pipe(
      skipWhile(x => x === false),
      take(1)
    )
    .toPromise()
    .then(() => {
      this.retrieveAuthorizedCollections();
    });
  }

  /**
   * Retrieve a list of collection names for which the user is authorized to view (has curator status for)
   *
   * @memberof AdminComponent
   */
  async retrieveAuthorizedCollections() {
    // we're sure the user is logged in here and so access groups should be defined
    return await Promise.all(
      this.authService.user.accessGroups
      .filter(group => group.includes('curator@'))
      .map(group =>
        this.collectionService.getCollection(group.split('@')[1]).then(c => this.authorizedCollections.push(c))
      ))
      .then(() => {
        // remove the initialization block
        this.collectionsLoaded = true;
      });
  }

  ngOnDestroy() {
    this.navbarService.show();
  }
}
