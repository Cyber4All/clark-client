export type OrganizationSector = 'academia' | 'government' | 'industry' | 'other';
export type OrganizationLevel =
  | 'elementary'
  | 'middle'
  | 'high'
  | 'community_college'
  | 'undergraduate'
  | 'graduate'
  | 'post_graduate'
  | 'training';

export interface Organization {
  _id: string;
  name: string;
  normalizedName: string;
  sector: OrganizationSector;
  levels: OrganizationLevel[];
  country?: string;
  state?: string;
  domains: string[];
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
