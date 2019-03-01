import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { DashboardLearningObject } from 'app/onion/dashboard/dashboard.component';
import { lengths as LengthsSet } from '@cyber4all/clark-taxonomy';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [LearningObjectService]
})
export class LearningObjectsComponent implements OnInit {

  learningObjects: any[];

  constructor(
    private learningObjectService: LearningObjectService,
  ) { }

  ngOnInit() {
    this.learningObjects = [
      {
        _id: '5aa0183becba9a264dcd806b',
        author: {
          name: 'nick visalli',
        },
        date: '1520530818714',
        goals: [
          {
            text: 'Introduce the concept of integer overflow in first programming courses'
          }
        ],
        outcomes: [
          '5aa0183becba9a264dcd806c'
        ],
        published: true,
        name: 'This is a really really really really really really really really long title',
        length: 'nanomodule',
        materials: {
          files: [],
          urls: [
            // tslint:disable-next-line:max-line-length
            { title: 'Online module', 'url': 'http://cis1.towson.edu/~cyber4all/modules/nanomodules/Integer_Error-CS2_C++.html'}, {'title': 'See a Security Injection Module in Action', 'url': 'https://youtu.be/MH_RD1jh0AE'}, {'title': 'How to use this module in your class', 'url': 'https://youtu.be/u47q-qX52JI'}], 'notes': '', 'pdf': {'name': '0ReadMeFirst - Integer Error - CS2 - C++.pdf', 'url': 'https://neutrino-file-uploads.s3.us-east-2.amazonaws.com/skaza/5aa0183becba9a264dcd806b/0ReadMeFirst%20-%20Integer%20Error%20-%20CS2%20-%20C%2B%2B.pdf'}}, 'levels': ['undergraduate'], 'contributors': ['5c6d71c29554c723fba68b19'], 'collection': 'secinj', 'lock': {'date': {'$numberDouble': '1538061211867'}, 'restrictions': ['download']}, 'status': 'released', 'description': 'Introduce the concept of integer overflow in first programming courses'},
        {
        _id: '5aa0183becba9a264dcd806b',
        author: {
          name: 'nick visalli',
        },
        date: '1520530818714',
        goals: [
          {
            text: 'Introduce the concept of integer overflow in first programming courses'
          }
        ],
        outcomes: [
          '5aa0183becba9a264dcd806c'
        ],
        published: true,
        name: 'Integer Error - CS2 - C++',
        length: 'nanomodule',
        materials: {
          files: [],
          urls: [
            // tslint:disable-next-line:max-line-length
            {title: 'Online module', 'url': 'http://cis1.towson.edu/~cyber4all/modules/nanomodules/Integer_Error-CS2_C++.html'}, {'title': 'See a Security Injection Module in Action', 'url': 'https://youtu.be/MH_RD1jh0AE'}, {'title': 'How to use this module in your class', 'url': 'https://youtu.be/u47q-qX52JI'}], 'notes': '', 'pdf': {'name': '0ReadMeFirst - Integer Error - CS2 - C++.pdf', 'url': 'https://neutrino-file-uploads.s3.us-east-2.amazonaws.com/skaza/5aa0183becba9a264dcd806b/0ReadMeFirst%20-%20Integer%20Error%20-%20CS2%20-%20C%2B%2B.pdf'}}, 'levels': ['undergraduate'], 'contributors': ['5c6d71c29554c723fba68b19'], 'collection': 'secinj', 'lock': {'date': {'$numberDouble': '1538061211867'}, 'restrictions': ['download']}, 'status': 'released', 'description': 'Introduce the concept of integer overflow in first programming courses'},
      ];
  }
 }
