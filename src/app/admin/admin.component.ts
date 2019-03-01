import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from 'app/core/navbar.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, skipWhile, take } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { CollectionService, Collection } from 'app/core/collection.service';


@Component({
  selector: 'clark-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject();

  authorizedCollections: Collection[] = [];
  activeCollection: string;

  adminMode: boolean;

  private _initialized: boolean[] = [ false /* collections loaded */ ];

  constructor(
    private navbarService: NavbarService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private collectionService: CollectionService
  ) {}

  /**
   * Returns true if the component is fully initialized (ie the array doesn't contain false), false otherwise
   *
   * @readonly
   * @type {boolean}
   * @memberof AdminComponent
   */
  get initialized(): boolean {
    return !this._initialized.includes(false);
  }

  ngOnInit() {
    // hide CLARK navbar
    this.navbarService.hide();

    if (this.authService.hasEditorAccess()) {
      this.adminMode = true;
      // we don't need to load collections, so we can set that initialization block to true
      this._initialized[0] = true;
    } else {
      // this user isn't an admin/editor so fetch the route parameter representing the selected collection
      this.route.paramMap
        .pipe(takeUntil(this.destroyed$))
        .subscribe(params => {
          // we don't need to authorize here since that's done in the route guard
          this.activeCollection = params.get('collection');
        });

      this.retrieveAuthorizedCollections().then(() => {
        // collections array is now set and we should redirect to the first collection
        if (!this.activeCollection) {
          this.router.navigate([this.authorizedCollections[0].abvName], { relativeTo: this.route });
        }
      });
    }
  }

  /**
   * Retrieve a list of collection names for which the user is authorized to view (has curator status for)
   *
   * @memberof AdminComponent
   */
  async retrieveAuthorizedCollections() {
    // wait for user to be logged in (edge case) and then fetch list of curated collections
    return await this.authService.isLoggedIn.pipe(
      skipWhile(x => x === false),
      take(1)
    ).toPromise().then(async () => {
      // we're sure the user is logged in here and so access groups should be defined
      return await Promise.all(
        this.authService.user['accessGroups']
        .filter(group => group.includes('curator@'))
        .map(group =>
          this.collectionService.getCollection(group.split('@')[1]).then(c => this.authorizedCollections.push(c))
        )).then(() => {
          // remove the initialization block
          this._initialized[0] = true;
        });
    });
  }

  ngOnDestroy() {
    this.navbarService.show();
  }
}
