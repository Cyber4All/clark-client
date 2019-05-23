import { Component, OnInit, Input } from '@angular/core';
import { AuthUser } from 'app/core/auth.service';
import { CollectionService } from 'app/core/collection.service';
import { Subject } from 'rxjs';
import { PrivilegeService } from 'app/core/privilege.service';
import { ToasterService } from 'app/shared/toaster';
import { trigger, transition, style, animate, animateChild, query, group } from '@angular/animations';

@Component({
  selector: 'clark-user-privileges',
  templateUrl: './user-privileges.component.html',
  styleUrls: ['./user-privileges.component.scss'],
  animations: [
    trigger('noPrivileges', [
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1, 1)' }),
        animate('300ms ease', style({ opacity: 0, transform: 'scale(1, 0.6)' })),
      ]),
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(1, 0.6)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'scale(1, 1)' }))
      ])
    ])
  ]
})
export class UserPrivilegesComponent implements OnInit {
  @Input() user: AuthUser;

  privileges: string[][] = [];
  collections: { [index: string]: string } = {};

  selectedRole: 'curator' | 'reviewer';
  selectedCollection: string;

  carouselAction$: Subject<string> = new Subject();

  constructor(private collectionService: CollectionService, private privilegeService: PrivilegeService, private toaster: ToasterService) {}

  ngOnInit() {
    this.getUserRoles();
  }

  private getUserRoles() {
    this.privilegeService.getRoles(this.user.id).then(roles => {
      this.privileges = roles.map(x => x.split('@'));
    this.getCollections();
    }).catch(error => {
      this.toaster.notify('Error!', 'There was an error fetching user\'s privileges. Please try again later.', 'bad', 'far fa-times');
      console.error(error);
    });
  }

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
        this.toaster.notify('Error!', 'There was an error fetching collections. Please try again later.', 'bad', 'far fa-times');
      });
    }

  advance(distance: number = 1) {
    this.carouselAction$.next('+' + distance);
  }

  regress(distance: number = 1) {
    this.carouselAction$.next('-' + distance);
  }

  selectCollection(collectionName: string) {
    this.selectedCollection = collectionName;
  }

  submit() {
    let collectionIndex = -1;
    for (let i = 0, l = this.privileges.length; i <l; i++) {
      if (this.privileges[i][1] === this.selectedCollection) {
        collectionIndex = i;
        break;
      }
    }

    let responsePromise: Promise<{}>;

    if (collectionIndex >= 0) {
      // user is already a member of this collection, should attempt to modify membership
      responsePromise = this.privilegeService.modifyMembership(this.selectedCollection, this.user.id, this.selectedRole);
    } else {
      // user isn't a member of this collection, let's add them
      responsePromise = this.privilegeService.addMembership(this.selectedCollection, this.user.id, this.selectedRole);
    }

    responsePromise.then(() => {
      this.advance();

      setTimeout(() => {
        if (collectionIndex >= 0) {
          this.privileges.splice(collectionIndex, 1);
        }

        this.privileges.push([this.selectedRole, this.selectedCollection]);
        this.getCollections();

          this.selectedCollection = undefined;
        this.selectedRole = undefined;
      }, 400);
      })
      .catch(error => {
        this.toaster.notify('Error!', 'There was an error adding a privilege. Please try again later.', 'bad', 'far fa-times');
        console.error(error);
      });
  }

  async remove(index: number) {
    const [_, collection] = this.privileges[index];
    this.privilegeService
      .removeMembership(collection, this.user.id)
      .then(() => {
      this.privileges.splice(index, 1);
        delete this.collections[collection];
      })
      .catch(error => {
        this.toaster.notify('Error!', 'There was an error removing a privilege. Please try again later.', 'bad', 'far fa-times');
        console.error(error);
      });
  }
}
