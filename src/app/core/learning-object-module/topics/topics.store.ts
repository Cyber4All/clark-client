import { Topic } from "@entity";
import { TopicsService } from "./topics.service";
import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class TopicsStore {
    private readonly cache = new Map<string, string>();
    private initialized: boolean;
    private initPromise: Promise<void> | null = null;
    
    constructor(private readonly topicsService: TopicsService){
        this.initialized = false;
        
    }

    private async initializeMap() {
        if(this.initialized) {
            return;
        }
        if (this.initPromise) {
            return this.initPromise;
        }
        this.initPromise = (async () => {
            console.log("Initializing topics map...");
            const topics = await this.topicsService.getTopics(); // grabs all topics
            console.log("FETCHED TOPICS:", topics);
            if (topics) {
                topics.forEach(topic => {
                    this.cache.set(topic._id, topic.name);
                });
            }
            this.initialized = true;
        })();
        return this.initPromise.finally(() => {
            this.initPromise = null;
        });
    }

    async topics$(id: string | null | undefined): Promise<Observable<Topic>> {
        console.log(`Fetching topic for id: ${id}`);
        if(!id){
            return of(null);
        }

        // Should only hit this block once since after the first call the cache will be populated with all topics
        if(!this.cache.has(id)) {
            // If the topic is not in the cache, fetch all topics and populate the cache again, since we don't have
            // an endpoint to fetch a single topic by id. This is not ideal, but it is necessary given the current API design.
            await this.initializeMap();
        }

        // console.log(`Cache contents: ${JSON.stringify(Array.from(this.cache.entries()))}`);
        console.log(`Returning topic for id ${id}: ${this.cache.get(id)}`);

        return this.cache.get(id) ? of({ _id: id, name: this.cache.get(id)! }) : of(null);
    }
}