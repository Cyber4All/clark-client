/* eslint-disable @typescript-eslint/no-inferrable-types */
import { LearningObject } from './learning-object';
import { User } from '../user/user';
import { LEARNING_OBJECT_ERRORS } from './error-messages';
import { LearningOutcome } from '../learning-outcome/learning-outcome';

// Defaults
const defaultLevel = LearningObject.Level.Undergraduate;

// Valid values
const validName = 'This is a valid name';
const validDescription = 'This is a valid description';
const validLength = LearningObject.Length.NANOMODULE;
const validLevel = LearningObject.Level.Training;
const validOutcome = new LearningOutcome();
const validMaterial: LearningObject.Material = {
  files: [],
  urls: [{ title: 'some valid title', url: 'some valid url' }],
  notes: 'these are notes',
  folderDescriptions: [
    { path: 'some valid path', description: 'some valid description' },
  ],
  pdf: { name: 'some pdf name', url: 'some valid url' },
};
const validMetrics: LearningObject.Metrics = {
  downloads: 22,
  saves: 22,
};
const validAuthor = new User({
  username: 'me123',
  name: 'Me',
  email: 'me@dev.com',
  organization: 'Meander',
});
const validContributor = new User({
  username: 'contrib123',
  name: 'Contributor',
  email: 'contrib@dev.com',
  organization: 'Society of Contributors',
});
const validCollection = 'some collection';
const validStatus = LearningObject.Status.RELEASED;

// Invalid values
const invalidName = '         ';
const invalidNameMin = 'h';
const invalidNameMax =
  // eslint-disable-next-line max-len
  '01234567891011121314151617181920212223242526272829303132333435363738394041424344454647484950012345678910111213141516171819202122232425262728293031323334353637383940414243444546474849500123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495001234567891011121314151617181920212223242526272829303132333435363738394041424344454647484950';
const invalidDescription: null = null;
const invalidLength = 'some length';
const invalidLevel = 'some level';
const invalidMaterial: null = null;
const invalidMetrics: null = null;
const invalidCollection: null = null;
const invalidStatus = 'some status';

describe('Class: LearningObject', () => {
  let object: LearningObject;
  beforeEach(() => {
    object = new LearningObject();
  });

  it('should return a new blank LearningObject', () => {
    expect(object).toBeDefined();
  });
  it('should return a new LearningObject with valid properties', () => {
    const someObject: Partial<LearningObject> = {
      author: validAuthor,
      name: validName,
      description: validDescription,
      date: Date.now().toString(),
      length: LearningObject.Length.COURSE,
      children: [new LearningObject()],
      contributors: [validContributor],
      collection: 'My collection',
      status: LearningObject.Status.PROOFING,
    };
    const newObject = new LearningObject(someObject);
    expect(newObject).toBeDefined();
  });
  //removes reliance on setTimeout which is unreliable in angular 14
  it('should return a new LearningObject with the same date that was passed in', () => {
    const date = Date.now().toString();
    const someObject: Partial<LearningObject> = {
      date,
    };
    const newObject = new LearningObject(someObject);
    expect(newObject.date).toEqual(date);
  });
  it('should set a valid name', () => {
    object.name = validName;
    expect(object.name).toEqual(validName);
  });
  it('should set an invalid name (min length) and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_NAME;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.name = invalidNameMin;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set an invalid name (max length) and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_NAME;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.name = invalidNameMax;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set a valid description', () => {
    object.description = validDescription;
    expect(object.description).toEqual(validDescription);
  });
  it('should set an invalid description and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_DESCRIPTION;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.description = invalidDescription;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set a valid length', () => {
    object.length = validLength;
    expect(object.length).toEqual(validLength);
  });
  it('should set an invalid length and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_LENGTH(invalidLength);
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.length = invalidLength;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should add a valid level', () => {
    object.addLevel(validLevel);
    expect(object.levels).toContain(validLevel);
  });
  it('should add an invalid level and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_LEVEL(invalidLevel);
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.addLevel(invalidLevel);
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should remove a level', () => {
    object.addLevel(validLevel);
    object.removeLevel(validLevel);
    expect(object.levels).not.toContain(validLevel);
  });
  it('should fail to remove a level and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_LEVELS;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.removeLevel(defaultLevel);
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should add a valid outcome', () => {
    object.addOutcome(validOutcome);
    expect(object.outcomes).toContain(validOutcome);
  });
  it('should add a new blank outcome', () => {
    const index = object.addOutcome();
    expect(object.outcomes).toContain(object.outcomes[index]);
  });
  it('should remove an outcome', () => {
    const index = object.addOutcome(validOutcome);
    object.removeOutcome(index);
    expect(object.outcomes).not.toContain(validOutcome);
  });
  it('should set valid materials', () => {
    object.materials = validMaterial;
    expect(object.materials).toEqual(validMaterial);
  });
  it('should set invalid materials and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_MATERIAL;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.materials = invalidMaterial;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set valid metrics', () => {
    object.metrics = validMetrics;
    expect(object.metrics).toEqual(validMetrics);
  });
  it('should set invalid metrics and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_METRICS;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.metrics = invalidMetrics;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should add a valid contributor', () => {
    object.addContributor(validContributor);
    expect(object.contributors).toContain(validContributor);
  });
  it('should remove a contributor', () => {
    const index = object.addContributor(validContributor);
    object.removeContributor(index);
    expect(object.levels).not.toContain(validContributor);
  });
  it('should set a valid collection', () => {
    object.collection = validCollection;
    expect(object.collection).toEqual(validCollection);
  });
  it('should set an invalid collection and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_COLLECTION;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.collection = invalidCollection;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set a valid status', () => {
    object.status = validStatus;
    expect(object.status).toEqual(validStatus);
  });
  it('should set an invalid status and throw an error', () => {
    const errorMessage = LEARNING_OBJECT_ERRORS.INVALID_STATUS(invalidStatus);
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.status = invalidStatus;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
});
