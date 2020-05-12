import { Component, OnInit } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';
import { LearningObjectService } from 'app/core/learning-object.service';
import { Query } from 'app/interfaces/query';
import { Subject } from 'rxjs';
import { TopicService } from 'app/core/topic.service';


@Component({
  selector: 'clark-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {
  
  objectKeys = Object.keys;

  learningObjects: LearningObject[];
  topicNames: string[];

  displayTopicsBuilderModal = false;

  discoveringTopics = false;

  newTopicDistribution = {};
  standardTopicDistribution = {};

  newTopicNames;

  selectedTopicObjects = [];
  selectedTopicName = '';

  changeTopicSelectedTopic: string;

  submissionGroup = {};
  
  query: Query = {
    currPage: 1,
    limit: 20,
    text: ''
  };

  carouselAction$: Subject<number> = new Subject();

  movingLearningObject: LearningObject;

  constructor(private learningObjectService: LearningObjectService, private topicService: TopicService) { }

  ngOnInit() {
    this.getLearningObjects();
    this.getLearningObjectTopics();
  }

  async getLearningObjects() {
    const response = await this.learningObjectService.fetchUnassignedLearningObjects();
    this.learningObjects = response['unassigned_learning_objects'];
  }

  async getLearningObjectTopics() {
    const response = await this.topicService.getLearningObjectTopics();
    this.topicNames = response.topics;
  }

  async discoverLearningObjectTopics() {
    this.discoveringTopics = true;
    const response = await this.learningObjectService.discoverLearningObjectTopics();
    this.newTopicDistribution = response['new_topics'];
    this.topicNames = this.topicNames.concat(this.objectKeys(this.newTopicDistribution));
    this.newTopicNames = this.objectKeys(response['new_topics']);
    this.standardTopicDistribution = response['standard_topics'];
    this.selectedTopicObjects = this.newTopicDistribution[this.objectKeys(this.newTopicDistribution)[0]]
    this.selectedTopicName = this.objectKeys(this.newTopicDistribution)[0];
    this.discoveringTopics = false;
    this.displayTopicsBuilderModal = true;
  }

  selectStandardTopic(topicName: string) {
    this.selectedTopicObjects = this.standardTopicDistribution[topicName];
    this.selectedTopicName = topicName;
  }

  selectNewTopic(topicName: string) {
    this.selectedTopicObjects = this.newTopicDistribution[topicName];
    this.selectedTopicName = topicName;
  }

  toggleTopicToSubmissionGroup(isSelected: boolean, topicName: string) {
    if (isSelected) {
      // If the checkbox is selected, add the topic the submission group
      const topicDistribution = this.newTopicDistribution[topicName] ? this.newTopicDistribution : this.standardTopicDistribution;
      this.submissionGroup[topicName] = topicDistribution[topicName];
    } else {
      // If the checkbox is unselected, remove the topic from the submissin group
      delete this.submissionGroup[topicName];
    }
  }

  changeNewTopicName(newName: string) {

    // Update reference in submission group if it exists
    if (this.submissionGroup[this.selectedTopicName]) {
      this.submissionGroup[newName] = this.submissionGroup[this.selectedTopicName];
      delete this.submissionGroup[this.selectedTopicName];
    }

    // Update name in topic list that is displayed in the change topic list
    const i = this.topicNames.indexOf(this.selectedTopicName);
    this.topicNames[i] = newName;

    // Update reference visible to user
    if (this.newTopicDistribution[this.selectedTopicName]) {
      this.newTopicDistribution[newName] = this.newTopicDistribution[this.selectedTopicName];
      delete this.newTopicDistribution[this.selectedTopicName]; 
      
      const index = this.newTopicNames.indexOf(this.selectNewTopicName);
      this.newTopicNames[index] = newName;
      this.selectedTopicName = newName;
    }
  }

  selectNewTopicName(topicName: string) {
    this.changeTopicSelectedTopic = topicName;
  }

  advance(learningObject: LearningObject) {
    this.carouselAction$.next(1);
    this.movingLearningObject = learningObject;
  }

  regress() {
    this.carouselAction$.next(-1);
  }

  changeTopic() {

    // selectedTopicName contains the original topic name for the moving Learning Object
    if (this.newTopicDistribution[this.selectedTopicName]) {

      // remove the moving Learning Object from it original distribution
      this.newTopicDistribution[this.selectedTopicName] = this.newTopicDistribution[this.selectedTopicName].filter((lo: any) => lo['_id'] !== this.movingLearningObject['_id']);

    } else if (this.standardTopicDistribution[this.selectedTopicName]) {

      // remove the moving Learning Object from it original distribution
      this.standardTopicDistribution[this.selectedTopicName] = this.standardTopicDistribution[this.selectedTopicName].filter((lo: LearningObject) => lo['_id'] !== this.movingLearningObject['_id']);

    }
    
    // add the moving Learning Object to its new distribution
    if (this.newTopicDistribution[this.changeTopicSelectedTopic]) {

      this.newTopicDistribution[this.changeTopicSelectedTopic].push(this.movingLearningObject);

      // View the changed topic on submission 
      this.selectedTopicObjects = this.newTopicDistribution[this.changeTopicSelectedTopic];

    } else if (this.standardTopicDistribution[this.changeTopicSelectedTopic]) {

      this.standardTopicDistribution[this.changeTopicSelectedTopic].push(this.movingLearningObject);

      // View the changed topic on submission 
      this.selectedTopicObjects = this.standardTopicDistribution[this.changeTopicSelectedTopic];
      
    } else {
      // If the new topic name does not exist is either distribution,
      // then it must be an existing unchanged topic the was fetched from the API
      // add this topic to the standard distribution
      this.standardTopicDistribution[this.changeTopicSelectedTopic] = [this.movingLearningObject];

      // View the changed topic on submission 
      this.selectedTopicObjects = this.standardTopicDistribution[this.changeTopicSelectedTopic];

    }

    // Update reference in submission group if it exists
    if (this.submissionGroup[this.selectedTopicName]) {

      // remove the moving Learning Object from it original distribution
      this.submissionGroup[this.selectedTopicName] = this.submissionGroup[this.selectedTopicName].filter((lo: any) => lo['_id'] !== this.movingLearningObject['_id']);

    }

    // Switch to changed topic view before regress
    this.selectedTopicName = this.changeTopicSelectedTopic;

    this.regress();

    this.movingLearningObject = null;

  }

  trackByFn(index: any, item: any) {
    return index;
  }


  submitChanges() {
    this.topicService.assignNewTopics(this.submissionGroup);
    this.displayTopicsBuilderModal = false;
  }
}
