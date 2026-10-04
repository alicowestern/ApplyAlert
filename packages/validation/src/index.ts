/**
 * @applyalert/validation
 *
 * Shared Zod validation schemas for runtime validation
 * of domain types and API payloads.
 */

export {
  DeadlineKindSchema,
  DeadlineSchema,
  type ValidatedDeadline,
} from './schemas/deadline';

export {
  OpportunityTypeSchema,
  ApplicationStatusSchema,
  FundingInfoSchema,
  SourceContentTypeSchema,
  OpportunitySourceSchema,
  OpportunitySchema,
  type ValidatedOpportunity,
} from './schemas/opportunity';

export {
  CreateOpportunityDtoSchema,
  UpdateOpportunityDtoSchema,
  UpdateStatusDtoSchema,
  ListOpportunitiesQuerySchema,
} from './schemas/api';
