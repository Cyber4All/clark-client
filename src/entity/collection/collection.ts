import { LearningObject } from '../learning-object/learning-object';
export interface Collection {
  name: string;
  learningObjects: LearningObject[];
}
