import { LOmocks } from './learning-object.mock';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { LearningObject } from '@cyber4all/clark-entity';

@Injectable()
export class LearningObjectServiceMock {

    learningObjects: LearningObject[] = [];
    constructor() {
        const token = 'test';
    }

    getExisting(): Observable<any> {
        this.learningObjects = LOmocks;
        return Observable.of(LOmocks);
    }
    // getPlan(id) {
    //     for (let o of this.learningObjects) {
    //         if (o.id == id) return o;
    //     }
    // }
    save(learningObjectContent) {
        return true;
    }
    create(learningObjectContent) {
        return true;
    }
    delete(learningObjectName: string) {
        return true;
    }
}