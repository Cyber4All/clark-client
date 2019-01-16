export interface LearningObjectStats {
  downloads: number;
  saves: number;
  total: number;
  released: number;
  lengths: {
    nanomodule: number;
    micromodule: number;
    module: number;
    unit: number;
    course: number;
  };
  blooms_distribution: {
    apply: number;
    evaluate: number;
    remember: number;
  };
}
