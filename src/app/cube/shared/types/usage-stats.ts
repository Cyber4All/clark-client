interface LearningObjectStats {
  released: number;
  underReview: number;
  downloads: number;
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
interface UserStats {
  total: number;
  organizations: number;
}
export interface UsageStats {
  objects: LearningObjectStats;
  users: UserStats;
}
