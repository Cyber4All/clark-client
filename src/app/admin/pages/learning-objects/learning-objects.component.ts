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

  learningObjects: LearningObject[];

  constructor(
    private learningObjectService: LearningObjectService,
  ) { }

  ngOnInit() {
    this.learningObjects = [
      // {
      //   _id: '5aa0183becba9a264dcd806b',
      //   authorID: '5a70fb5ed45bde3f9d65a88c',
      //   date: '1520530818714',
      //   goals: [
      //     {
      //       text: 'Introduce the concept of integer overflow in first programming courses'
      //     }
      //   ],
      //   outcomes: [
      //     '5aa0183becba9a264dcd806c'
      //   ],
      //   published: true,
      //   name: 'Integer Error - CS2 - C++',
      //   length: "nanomodule",
      //   materials:{
      //     files:[],
      //     urls:[
      //       // tslint:disable-next-line:max-line-length
      //       {title:'Online module','url':'http://cis1.towson.edu/~cyber4all/modules/nanomodules/Integer_Error-CS2_C++.html'},{'title':'See a Security Injection Module in Action','url':'https://youtu.be/MH_RD1jh0AE'},{'title':'How to use this module in your class','url':'https://youtu.be/u47q-qX52JI'}],'notes':'','pdf':{'name':'0ReadMeFirst - Integer Error - CS2 - C++.pdf','url':'https://neutrino-file-uploads.s3.us-east-2.amazonaws.com/skaza/5aa0183becba9a264dcd806b/0ReadMeFirst%20-%20Integer%20Error%20-%20CS2%20-%20C%2B%2B.pdf'}},'levels':['undergraduate'],'contributors':['5c6d71c29554c723fba68b19'],'collection':'secinj','lock':{'date':{'$numberDouble':'1538061211867'},'restrictions':['download']},'status':'released','description':'Introduce the concept of integer overflow in first programming courses'}
    ];
  }

  /**
   * Fetches logged-in user's learning objects from API and builds the hierarchy structure
   *@returns DashboardLearningObject[]
   * @memberof DashboardComponent
   */
//   async getLearningObjects(filters?: any): Promise<DashboardLearningObject[]> {
//     // filters = {text: 'nick'};
//     // return this.learningObjectService
//     //   .getLearningObjects(filters)
//     //   .then((learningObjects: DashboardLearningObject[]) => {
//     //     console.log(learningObjects.learningObjects);
//     //     // deep copy list of learningObjects and initialize empty parents array
//     //     const arr: DashboardLearningObject[] = Array.from(
//     //       learningObjects.map(l => {
//     //         const newLo = l as DashboardLearningObject;
//     //         newLo.parents = [];

//     //         if (!newLo.status) {
//     //           newLo.status = LearningObject.Status.UNRELEASED;
//     //         }
//     //         return newLo as DashboardLearningObject;
//     //       })
//     //     );

//     //     const lengths = Array.from(LengthsSet.values());

//     //     arr.sort((a, b) => {
//     //       return lengths.indexOf(a.length) <= lengths.indexOf(b.length) ? 1 : 0;
//     //     });

//     //     const m: Map<string, DashboardLearningObject> = new Map(
//     //       // @ts-ignore typescript doesn't like arr.map...
//     //       arr.map(l => [l.id, l])
//     //     );

//     //     for (let i = 0, l = arr.length; i < l; i++) {
//     //       const lo = arr[i];
//     //       if (lo.children && lo.children.length) {
//     //         for (const c of lo.children as DashboardLearningObject[]) {
//     //           m.get(c.id).parents
//     //             ? m.get(c.id).parents.push(lo.name)
//     //             : (m.get(c.id).parents = [lo.name]);
//     //         }
//     //       }
//     //     }

//     //     return learningObjects as DashboardLearningObject[];
//     //   })
//     //   .catch(err => {
//     //     console.error(err);
//     //     return Promise.reject('');
//     //   });
//   }
 }
