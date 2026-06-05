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

    private async initializeMap(forceRefresh: boolean = false) {
        if(this.initialized && !forceRefresh) {
            return;
        }
        if (this.initPromise) {
            return this.initPromise;
        }
        this.initPromise = (async () => {
            const topics = await this.topicsService.getTopics(); // grabs all topics
            this.cache.clear();
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

    async topics$(id: string): Promise<Observable<Topic | null>> {
        if(!this.cache.has(id)) {
            await this.initializeMap();
        }

        if (!this.cache.has(id)) {
            await this.initializeMap(true);
        }

        return this.cache.get(id) ? of({ _id: id, name: this.cache.get(id)! }) : of(null);
    }
}
