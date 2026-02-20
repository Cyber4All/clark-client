/**
 * Organization domain types for Angular client
 */

export type OrganizationSector =
  | 'academia'
  | 'government'
  | 'industry'
  | 'other';

export type OrganizationLevel =
  | 'elementary'
  | 'middle'
  | 'high'
  | 'community_college'
  | 'undergraduate'
  | 'graduate'
  | 'post_graduate'
  | 'training';

/**
 * Organization entity (as received from API)
 */
export interface Organization {
  _id: string; // ObjectId on server -> string on client
  name: string;
  normalizedName: string;
  sector: OrganizationSector;
  levels: OrganizationLevel[];
  country?: string;
  state?: string;
  domains: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request interfaces (what client sends to API)
 */

export interface SearchOrganizationsRequest {
  text?: string;
  sector?: OrganizationSector;
  levels?: OrganizationLevel[]; // encoded as CSV in query param
  isVerified?: boolean;
  domain?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrganizationRequest {
  name: string;
  sector: OrganizationSector;
  levels: OrganizationLevel[];
  state?: string;
  country?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  sector?: OrganizationSector;
  levels?: OrganizationLevel[];
  country?: string;
  state?: string;
  domains?: string[];
  isVerified?: boolean;
}

/**
 * Response interfaces (what client receives from API)
 */

export interface SuggestDomainResponse {
  organization: Organization | null;
}

export interface CreateOrganizationResponse {
  organization: Organization;
}

export interface UpdateOrganizationResponse {
  organization: Organization;
}
