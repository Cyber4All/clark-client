import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { UserService } from 'app/core/user.service';

@Component({
  selector: 'clark-curators',
  templateUrl: './curators.component.html',
  styleUrls: ['./curators.component.scss']
})
export class CuratorsComponent implements OnInit {
  @Input() collectionName : string;
  curators: any;

  constructor(private userService: UserService, private collectionService: CollectionService) { }

  async ngOnInit(): Promise<void> {
    this.curators = await this.collectionService.getCollectionCuratorsInfo(this.collectionName);
  }

}
