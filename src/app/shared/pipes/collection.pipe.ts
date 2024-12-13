import { Pipe, PipeTransform } from '@angular/core';
import { CollectionService } from 'app/core/collection-module/collections.service';

/**
 * Takes an abbreviated collection name and returns the full collection name
 *
 * @export
 * @class CollectionPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'collection'
})
export class CollectionPipe implements PipeTransform {

  constructor(private collections: CollectionService) {}

  transform(abvName: any): Promise<string> {
    return this.collections.getCollection(abvName).then(val => {
      return val.name;
    });
  }

}
