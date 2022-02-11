/* eslint-disable @typescript-eslint/naming-convention */
import { LearningObject, User } from '@entity';

export const LOmock1 = new LearningObject({ author: new User(), name: 'LOmock1' });

export const LOmock2 = new LearningObject({ author: new User(), name: 'LOmock2' });

export const LOmocks: any = [LOmock1, LOmock2];
