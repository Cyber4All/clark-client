/* eslint-disable @typescript-eslint/naming-convention */
export enum LEVEL {
    ELEMENTARY = 'elementary',
    MIDDLE = 'middle',
    HIGH = 'high',
    UNDERGRADUATE = 'undergraduate',
    GRADUATE = 'graduate',
    POST_GRADUATE = 'post graduate',
    COMMUNITY_COLLEGE = 'community college',
    PROFESSIONAL = 'professional development',
    GRADE_K_TO_1 = 'grade k-1',
    GRADE_2_TO_3 = 'grade 2-3',
    GRADE_4_TO_5 = 'grade 4-5',
    GRADE_6_TO_8 = 'grade 6-8',
    GRADE_9_TO_12 = 'grade 9-12',
    GRADE_10_TO_12 = 'grade 10-12',
}

export const VALID_LEVELS = [
    LEVEL.ELEMENTARY, LEVEL.MIDDLE, LEVEL.HIGH, LEVEL.UNDERGRADUATE,
    LEVEL.GRADUATE, LEVEL.POST_GRADUATE, LEVEL.COMMUNITY_COLLEGE, LEVEL.PROFESSIONAL,
    LEVEL.GRADE_K_TO_1, LEVEL.GRADE_2_TO_3, LEVEL.GRADE_4_TO_5, LEVEL.GRADE_6_TO_8,
    LEVEL.GRADE_9_TO_12, LEVEL.GRADE_10_TO_12,
];

export enum GUIDELINE_STANDARD_PROPERTY {
    ID = 'id',
    NAME = 'name',
    LEVELS = 'levels',
    YEAR = 'year',
    FRAMEWORK_ID = 'framework id',
    GUIDELINE_OR_DESCRIPTION = 'guideline or description',
}
