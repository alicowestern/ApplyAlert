import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/middleware/dev-user.middleware';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateOpportunityDtoSchema,
  UpdateOpportunityDtoSchema,
  UpdateStatusDtoSchema,
  ListOpportunitiesQuerySchema,
} from '@applyalert/validation';
import {
  ApiResponse,
  PaginatedResponse,
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  UpdateStatusDto,
  ListOpportunitiesQuery,
} from '@applyalert/contracts';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';

@ApiTags('opportunities')
@Controller({
  path: 'opportunities',
  version: '1',
})
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity' })
  @SwaggerApiResponse({ status: 201, description: 'The opportunity has been successfully created.' })
  @UsePipes(new ZodValidationPipe(CreateOpportunityDtoSchema))
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOpportunityDto,
  ): Promise<ApiResponse<Opportunity>> {
    const data = await this.opportunitiesService.create(user.id, dto);
    return { success: true, data, error: null };
  }

  @Get()
  @ApiOperation({ summary: 'List opportunities with filters and pagination' })
  @UsePipes(new ZodValidationPipe(ListOpportunitiesQuerySchema))
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListOpportunitiesQuery,
  ): Promise<ApiResponse<PaginatedResponse<Opportunity>>> {
    const data = await this.opportunitiesService.findAll(user.id, query);
    return { success: true, data, error: null };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity by ID' })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<Opportunity>> {
    const data = await this.opportunitiesService.findById(user.id, id);
    return { success: true, data, error: null };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an opportunity' })
  @UsePipes(new ZodValidationPipe(UpdateOpportunityDtoSchema))
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ): Promise<ApiResponse<Opportunity>> {
    const data = await this.opportunitiesService.update(user.id, id, dto);
    return { success: true, data, error: null };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update opportunity application status' })
  @UsePipes(new ZodValidationPipe(UpdateStatusDtoSchema))
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ): Promise<ApiResponse<Opportunity>> {
    const data = await this.opportunitiesService.updateStatus(user.id, id, body.status);
    return { success: true, data, error: null };
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive an opportunity' })
  async archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<Opportunity>> {
    const data = await this.opportunitiesService.archive(user.id, id);
    return { success: true, data, error: null };
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore an archived opportunity' })
  async restore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<Opportunity>> {
    const data = await this.opportunitiesService.restore(user.id, id);
    return { success: true, data, error: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete an opportunity' })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.opportunitiesService.delete(user.id, id);
  }
}
