import { Component, OnInit, Input } from '@angular/core';
import { AuthUser } from 'app/core/auth.service';
import { CollectionService } from 'app/core/collection.service';
import { Subject } from 'rxjs';

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

  constructor(private collectionService: CollectionService) { }

  ngOnInit() {
    this.privileges = this.user.accessGroups.map(x => x.split('@'));
    this.getCollections();
  }

  async getCollections() {
    for (const p of this.privileges) {
      this.collections.push((await this.collectionService.getCollection(p[1])).name);
    }
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
    // TODO submission logic here

    this.advance();

    setTimeout(() => {
      this.privileges.push([this.selectedRole, this.selectedCollection]);
      this.getCollections();

      this.selectCollection = undefined;
      this.selectedRole = undefined;
    }, 400);
  }
}
