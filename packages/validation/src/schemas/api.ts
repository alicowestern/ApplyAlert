import { z } from 'zod';
import { OpportunitySchema, ApplicationStatusSchema } from './opportunity';

export const CreateOpportunityDtoSchema = OpportunitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  appliedAt: true,
  archivedAt: true,
});

export const UpdateOpportunityDtoSchema = OpportunitySchema.pick({
  title: true,
  organization: true,
  opportunityType: true,
  summary: true,
  location: true,
  funding: true,
  applicationUrl: true,
  deadline: true,
}).partial();

export const UpdateStatusDtoSchema = z.object({
  status: ApplicationStatusSchema,
});

export const ListOpportunitiesQuerySchema = z.object({
  status: ApplicationStatusSchema.optional(),
  archived: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
  search: z.string().optional(),
  sort: z.enum(['deadline', 'createdAt', 'updatedAt']).optional(),
  limit: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().int().min(1).max(100).optional()
  ),
  cursor: z.string().optional(),
});
