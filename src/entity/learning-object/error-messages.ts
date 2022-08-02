export const LEARNING_OBJECT_ERRORS = {
  INVALID_NAME: 'Name must be a defined string more than two characters and less than one hundred characters.',
  INVALID_CHARACTER_IN_NAME: 'Learning object name cannot contain the following: / * : \\ \" < > ?',
  INVALID_DESCRIPTION: 'Description must be defined.',
  INVALID_LENGTH(length: any) {
    if (!length) {
      return 'Length must be defined.';
    }
    return `${length} is not a valid length.`;
  },
  LEVEL_EXISTS(level: any) {
    return `${level} has already been added.`;
  },
  INVALID_LEVEL(level: any) {
    return `${level} is not a valid level.`;
  },
  LEVEL_DOES_NOT_EXIST(level: any) {
    return `${level} does not exist on this object.`;
  },
  INVALID_LEVELS: 'Levels must contain at least one valid academic level.',
  INVALID_STATUS(status: any) {
    if (!status) {
      return 'Status must be defined.';
    }
    return `${status} is not a valid status.`;
  },
  INVALID_OUTCOME: 'Outcome must be a valid outcome.',
  INVALID_CHILD: 'Child object must be defined.',
  INVALID_CONTRIBUTOR: 'Contributor must be defined.',
  INVALID_CONTRIBUTOR_LENGTH: 'Object must contain at least one contributor.',
  INVALID_MATERIAL: 'Material must be defined.',
  INVALID_METRICS: 'Metrics must be defined.',
  INVALID_COLLECTION: 'Collection must be defined.',
  ID_SET: 'Id has already been set and cannot be modified.'
};

export const SUBMITTABLE_LEARNING_OBJECT_ERRORS = {
  INVALID_DESCRIPTION: 'Description must not be an empty string.',
  INVALID_OUTCOMES: 'Outcomes must contain at least one valid outcome.'
};
