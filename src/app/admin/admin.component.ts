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

  private _initialized: boolean[] = [false];

  constructor(
    private navbarService: NavbarService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private collectionService: CollectionService
  ) {}

  get initialized(): boolean {
    return !this._initialized.includes(false);
  }

  ngOnInit() {
    // hide CLARK navbar
    this.navbarService.hide();

    if (this.authService.hasEditorAccess()) {
      this.adminMode = true;
    } else {
      // fetch the route parameter representing the selected collection
      this.route.paramMap
        .pipe(takeUntil(this.destroyed$))
        .subscribe(params => {
          // we don't need to authorize here since that's done in the route guard
          this.activeCollection = params.get('collection');
        });

      this.retrieveAuthorizedCollections().then(() => {
        console.log(this.authorizedCollections);
        // collections array is not set and we should redirect to the first collection
        this.router.navigate([this.authorizedCollections[0].abvName], { relativeTo: this.route });
      });
    }
  }

  /**
   * Retrieve a list of collection names for which the user is authorized to view (has curator status for)
   *
   * @memberof AdminComponent
   */
  async retrieveAuthorizedCollections() {
    return await this.authService.isLoggedIn.pipe(
      skipWhile(x => x === false),
      take(1)
    ).subscribe(async () => {
      // we're sure the user is logged in here and so access groups should be defined
      return await Promise.all(this.authService.user['accessGroups']
        .filter(group => group.includes('curator@'))
        .map(group =>
          this.collectionService.getCollection(group.split('@')[1]).then(c => this.authorizedCollections.push(c))
        )).then(() => {
          this._initialized[0] = true;
        });
    });
  }

  ngOnDestroy() {
    this.navbarService.show();
  }
}
