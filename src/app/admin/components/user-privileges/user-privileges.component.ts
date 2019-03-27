import { Component, OnInit, Input } from '@angular/core';
import { AuthUser } from 'app/core/auth.service';
import { CollectionService } from 'app/core/collection.service';
import { Subject } from 'rxjs';
import { PrivilegeService } from 'app/core/privilege.service';

@Component({
  selector: 'clark-user-privileges',
  templateUrl: './user-privileges.component.html',
  styleUrls: ['./user-privileges.component.scss']
})
export class UserPrivilegesComponent implements OnInit {
  @Input() user: AuthUser;

  privileges: string[][];
  collections: string[] = [];

  selectedRole: 'curator' | 'reviewer';
  selectedCollection: string;

  carouselAction$: Subject<string> = new Subject();

  constructor(private collectionService: CollectionService, private privilegeService: PrivilegeService) {}

  ngOnInit() {
    this.privileges = this.user.accessGroups.map(x => x.split('@'));
    this.getCollections();
  }

  async getCollections() {
    for (const p of this.privileges) {
      this.collections.push(
        (await this.collectionService.getCollection(p[1])).name
      );
    }
  }

  advance(distance: number = 1) {
    this.carouselAction$.next('+' + distance);
  }

  regress(distance: number = 1) {
    this.carouselAction$.next('-' + distance);
  }

  selectCollection(collectionName: string) {
    alert(collectionName);
    this.selectedCollection = collectionName;
  }

  async submit() {
    alert(this.selectedCollection);
    // TODO submission service logic here
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
          this.collections.splice(collectionIndex, 1);
        }

        this.privileges.push([this.selectedRole, this.selectedCollection]);
        this.getCollections();

        this.selectCollection = undefined;
        this.selectedRole = undefined;
      }, 400);
    }).catch(error => {
      console.error(error);
      alert('An error occurred!');
    });
  }

  async remove(index: number) {
    this.privilegeService.removeMembership(this.privileges[index][1], this.user.id).then(() => {
      this.privileges.splice(index, 1);
      this.collections.splice(index, 1);
    }).catch(error => {
      console.error(error);
      alert('An error occurred!');
    });
  }
}
