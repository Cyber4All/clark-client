import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import {NavbarService} from '../../../core/navbar.service';


@Component({
  selector: 'clark-collection-ncyte',
  templateUrl: './collection-ncyte.component.html',
  styleUrls: ['./collection-ncyte.component.scss']
})
export class CollectionNcyteComponent implements OnInit, OnDestroy {

  constructor(private navbarService: NavbarService, private collectionService: CollectionService) { }

  ngOnInit(): void {
    this.navbarService.show();
  }
  ngOnDestroy(): void {
    this.navbarService.hide();
  }
}
