import { Component, OnInit, Input } from '@angular/core';
import { AuthUser } from 'app/core/auth-module/auth.service';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { Subject } from 'rxjs';
import { PrivilegeService } from 'app/admin/core/privilege.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { userPrivilegesAnimations } from './user-privileges.component.animations';
import { AccessGroupService, AccessGroups } from 'app/core/access-group-module/access-group.service';

@Component({
  selector: 'clark-user-privileges',
  templateUrl: './user-privileges.component.html',
  styleUrls: ['./user-privileges.component.scss'],
  animations: userPrivilegesAnimations
})
export class UserPrivilegesComponent implements OnInit {
  @Input() user: AuthUser;

  privileges: string[][] = [];
  collections: { [index: string]: string } = {};

  selectedRole: 'curator' | 'reviewer' | 'mapper';
  selectedCollection: string;

  carouselAction$: Subject<number> = new Subject();

  constructor(
    private accessGroupService: AccessGroupService,
    private collectionService: CollectionService,
    private privilegeService: PrivilegeService,
    private toaster: ToastrOvenService
  ) {}

  ngOnInit() {
    this.getUserRoles();
  }

  /**
   * Retrieve the list of privileges for the active user from a service
   *
   * @private
   * @memberof UserPrivilegesComponent
   */
  private getUserRoles() {
    this.privilegeService.getCollectionRoles(this.user.id).then(roles => {
      this.privileges = roles.map(x => x.split('@'));
    this.getCollections();
    }).catch(error => {
      this.toaster.error('Error!', 'There was an error fetching this user\'s privileges. Please try again later.');
      console.error(error);
    });
  }

  /**
   * Map the full name of the appropriate collection to the list of privileges.
   * Ex: ['curator', 'secinj'] becomes ['curator', 'security injections']
   *
   * @memberof UserPrivilegesComponent
   */
  async getCollections() {
    await Promise.all(
      this.privileges.map(async priv => {
        const [_, collectionId] = priv;
        if (collectionId) {
          this.collections[
            collectionId
          ] = (await this.collectionService.getCollection(collectionId)).name;
        }
      })
      ).catch(error => {
        this.toaster.error('Error!', 'There was an error fetching collections. Please try again later.');
      });
    }

  /**
   * Move the carousel forward by a factor of {distance}
   *
   * @param {number} [distance=1] the number of slides to advance
   * @memberof UserPrivilegesComponent
   */
  advance(distance: number = 1) {
    this.carouselAction$.next(distance);
  }

  /**
   * Move the carousel backward by a factor of {distance}
   *
   * @param {number} [distance=1] the number of slides to regress
   * @memberof UserPrivilegesComponent
   */
  regress(distance: number = 1) {
    this.carouselAction$.next(distance * -1);
  }

  /**
   * Set the selectedCollection property to the given collection name
   *
   * @param {string} collectionName the name of the selected collection
   * @memberof UserPrivilegesComponent
   */
  selectCollection(collectionName: string) {
    this.selectedCollection = collectionName;
  }

  /**
   * Submit the addition of the privilege to the user
   *
   * @memberof UserPrivilegesComponent
   */
  submit() {
    // attempt to find this privilege the user's list of existing privileges
    let collectionIndex = -1;
    for (let i = 0, l = this.privileges.length; i < l; i++) {
      if (this.privileges[i][1] === this.selectedCollection) {
        collectionIndex = i;
        break;
      }
    }

    if (collectionIndex === -1) {
      // user isn't a member of this collection, let's add them
      this.accessGroupService
        .addAccessGroupToUser(
          this.user.username,
          this.selectedRole,
          this.selectedCollection
        )
        .then(() => {
          this.advance(2);

          // wait for the carousel animation to complete before updating the list of privileges
          // in the UI so that the user can visualize the addition of the privilege
          setTimeout(() => {
            if (collectionIndex >= 0) {
              // remove the privilege from the list if it exists
              this.privileges.splice(collectionIndex, 1);
            }

            this.privileges.push([this.selectedRole, this.selectedCollection]);
            this.getCollections();

            this.selectedCollection = undefined;
            this.selectedRole = undefined;
          }, 400);
        })
        .catch(error => {
          this.toaster.error('Error!', 'There was an error adding a privilege. Please try again later.');
          console.error(error);
        });
    }
  }

  addMapper() {
    this.accessGroupService
      .addAccessGroupToUser(
        this.user.username,
        AccessGroups.MAPPER
      )
      .catch(error => {
        if (error.status === 201) {
          this.advance();

          setTimeout(() => {

            this.privileges.push([this.selectedRole, '']);
            this.getCollections();

            this.selectedCollection = undefined;
            this.selectedRole = undefined;
          }, 400);
        }
      });
  }

  /**
   * Remove the privilege at the specified index
   *
   * @param {number} index the index of the privilege in the privileges list
   * @memberof UserPrivilegesComponent
   */
  async remove(index: number) {
    const [_, collection] = this.privileges[index];
    this.privilegeService
      .removeCollectionMembership(collection, this.user.id)
      .then(() => {
      this.privileges.splice(index, 1);
        delete this.collections[collection];
      })
      .catch(error => {
        this.toaster.error('Error!', 'There was an error removing a privilege. Please try again later.');
        console.error(error);
      });
  }

  /**
   * Return all collections that the user has the role defined in the selectedRole property.
   * Ex: if the selectedRole property is 'curator', then this function returns all collections for which this user is a curator
   *
   * @readonly
   * @memberof UserPrivilegesComponent
   */
  get collectionsWithSelectedRole() {
    if (this.selectedRole) {
      return this.privileges.filter(x => x[0] === this.selectedRole).map(x => x[1]);
    }
  }
}
