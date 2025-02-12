
// Source: https://github.com/Cyber4All/standard-guidelines-service/blob/35746f6599bd6e67682714bd3c63389c039ddb1c/src/shared/types/Tag.ts
export enum TagType {
  BADGE = 'badge',
  INFO = 'info',
  CODE = 'code',
  LANG = 'lang',
  TECH = 'tech',
  TRENDING = 'trending',
  QUALITY = 'quality',
  WORK_ROLE = 'work_role',
  MODALITY = 'modality',
  MATERIALS = 'materials',
}

export interface Tag {
  _id: string;
  type: string[];
  name: string;
  description?: string;
}
