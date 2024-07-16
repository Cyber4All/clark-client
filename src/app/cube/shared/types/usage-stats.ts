/* eslint-disable @typescript-eslint/naming-convention */
export interface LearningObjectStats {
  review: number;
  total: number;
  released: number;
  downloads: number;
  topDownloads: any[];
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
  status: {
    waiting: number;
    peerReview: number;
    acceptedMinor: number;
    acceptedMajor: number;
    proofing: number;
  };
  collections: { number: number };
}

export interface UserMetrics {
  accounts: number;
  organizations: number;
}

export interface UsageStats {
  objects: LearningObjectStats;
  users: UserMetrics;
}
