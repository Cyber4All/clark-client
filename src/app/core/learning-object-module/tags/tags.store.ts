import { Tag } from "@entity";
import { TagsService } from "./tags.service";
import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class TagsStore {

    private readonly cache = new Map<string, Tag>();
    private readonly pending = new Map<string, Promise<Tag | null>>();
    constructor(private readonly tagsService: TagsService){}
 
    async tag$(id: string): Promise<Observable<Tag | null>> {
        if (this.cache.has(id)) {
            return of(this.cache.get(id)!);
        }

        if (!this.pending.has(id)) {
            this.pending.set(
                id,
                this.tagsService.getTag(id)
                    .then((tag) => {
                        if (tag) {
                            this.cache.set(id, tag);
                        }
                        return tag ?? null;
                    })
                    .catch((e) => {
                        console.error(`Failed to fetch tag ${id}:`, e); // temporary log then return null to avoid breaking LO component
                        return null;
                    })
                    .finally(() => {
                        this.pending.delete(id);
                    })
            );
        }

        const tag = await this.pending.get(id)!;

        return tag ? of(tag) : of(null);
    }
}
