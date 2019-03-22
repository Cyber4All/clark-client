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

  advance() {
    this.carouselAction$.next('+1');
  }

  regress() {
    this.carouselAction$.next('-1');
  }
}
