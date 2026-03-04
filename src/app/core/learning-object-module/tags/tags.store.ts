import { Tag } from "@entity";
import { TagsService } from "./tags.service";
import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class TagsStore {

    private readonly cache = new Map<string, Tag>();
    constructor(private readonly tagsService: TagsService){}
 
    tag$(id: string | null | undefined): Observable<Tag | null> {
        if(!id) {
            return of(null);
        }
        
        if(!this.cache.has(id)) {
            const tag$ = this.tagsService.getTag(id).then((tag) => {
                this.cache.set(id, tag);
            });
        }

        return this.cache.get(id) ? of(this.cache.get(id)!) : of(null);
    }
}