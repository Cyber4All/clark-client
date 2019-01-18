import { LearningObject, User } from '@cyber4all/clark-entity';

export const LOmock1 = new LearningObject({ author: new User(), name: 'LOmock1' });

export const LOmock2 = new LearningObject({ author: new User(), name: 'LOmock2' });

export const LOmocks: any = [LOmock1, LOmock2];
