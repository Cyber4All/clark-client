export interface LearningObjectStats {
  released: number;
  underReview: number;
  downloads: number;
  collections: { number: number };
  lengths: {
    nanomodule: number;
    micromodule: number;
    module: number;
    unit: number;
    course: number;
  };
  outcomes: {
    remember_and_understand: number;
    apply_and_analyze: number;
    evaluate_and_synthesize: number;
  };
}
export interface UserStats {
  accounts: number;
  organizations: number;
}

export interface UsageStats {
  objects: LearningObjectStats;
  users: UserStats;
}
