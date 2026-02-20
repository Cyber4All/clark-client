/**
 * Zod schemas for runtime validation of organization API responses
 */

import { z } from 'zod';
import { ORGANIZATION_SECTORS, ORGANIZATION_LEVELS } from './organization.types';

/**
 * Organization sector schema (references shared const array)
 */
export const OrganizationSectorSchema = z.enum(ORGANIZATION_SECTORS);

/**
 * Organization level schema (references shared const array)
 */
export const OrganizationLevelSchema = z.enum(ORGANIZATION_LEVELS);

/**
 * Organization entity schema
 */
export const OrganizationSchema = z.object({
    _id: z.string(),
    name: z.string(),
    normalizedName: z.string(),
    sector: OrganizationSectorSchema,
    levels: z.array(OrganizationLevelSchema),
    country: z.string().optional(),
    state: z.string().optional(),
    domains: z.array(z.string()),
    isVerified: z.boolean(),
    createdAt: z.string().default(''),
    updatedAt: z.string().default(''),
});

/**
 * Array of organizations (for search results)
 */
export const OrganizationArraySchema = z.array(OrganizationSchema);

/**
 * Response schemas
 */

export const SuggestDomainResponseSchema = z.object({
    organization: z.union([OrganizationSchema, z.null()]),
});

export const CreateOrganizationResponseSchema = z.object({
    organization: OrganizationSchema,
});

export const UpdateOrganizationResponseSchema = z.object({
    organization: OrganizationSchema,
});

export const GetOrganizationByIdResponseSchema = z.object({
    organization: OrganizationSchema,
});

export const SearchOrganizationsResponseSchema = z.object({
    organizations: OrganizationArraySchema,
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
});
