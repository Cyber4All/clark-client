import { Topic } from "@entity";
import { TopicsService } from "./topics.service";
import { Observable, of } from "rxjs";
import { map, shareReplay } from "rxjs/operators";



export class TopicsStore {
    private readonly cache = new Map<string, string>();
    
    
    constructor(private readonly topicsService: TopicsService){}

    async topics$(id: string | null | undefined): Promise<Observable<Topic | null>> {
        if(!id){
            return of(null);
        }

        // Should only hit this block once since after the first call the cache will be populated with all topics
        if(!this.cache.has(id)) {
            // If the topic is not in the cache, fetch all topics and populate the cache again, since we don't have
            // an endpoint to fetch a single topic by id. This is not ideal, but it is necessary given the current API design.
            const topics = await this.topicsService.getTopics();
            topics.forEach((t) => {
                this.cache.set(t._id, t.name);
            });
        }
        return // this.cache.get(id)
    }
}