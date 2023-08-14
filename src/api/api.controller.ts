import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CollectionService } from './collection/collection.service';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@nestjs/cache-manager';
import * as qs from 'qs';
import { JwtGuard } from '../auth/jwt-guard/jwt.guard';

// @UseGuards(JwtGuard)
@ApiTags('api')
@Controller('api/:collection')
export class ApiController {
  public constructor(private readonly collectionService: CollectionService) {}

  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @ApiOperation({ summary: 'Create a new item', operationId: 'createOne' })
  @Post()
  public create(
    @Param('collection') collection: string,
    @Body() body: Record<string, any>,
  ) {
    return this.collectionService.create(collection, body);
  }

  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @ApiOperation({ summary: 'Update an item', operationId: 'updateOne' })
  @Put(':id')
  public updateOne(
    @Param('collection') collection: string,
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    return this.collectionService.updateOne(collection, id, body);
  }

  @CacheKey(':collection/:id')
  @ApiOperation({ summary: 'Get an item', operationId: 'getOne' })
  @Get(':id')
  public async get(
    @Param('collection') collection: string,
    @Param('id') id: string,
  ) {
    const items = await this.collectionService.findItems(collection, {
      _id: { $eq: id },
    });
    return items[0];
  }

  @ApiQuery({
    name: 'query',
    required: false,
    schema: {
      additionalProperties: true,
    },
  })
  @CacheKey('collection')
  @ApiOperation({ summary: 'Get items', operationId: 'getMultiple' })
  @Get()
  public async getItems(
    @Param('collection') collection: string,
    @Query('query') query: any,
  ) {
    return await this.collectionService.findItems(
      collection,
      query ? qs.parse(query) : undefined,
    );
  }

  @ApiOperation({ summary: 'Delete an item', operationId: 'deleteOne' })
  @Delete(':id')
  public async deleteOne(
    @Param('collection') collection: string,
    @Param('id') id: string,
  ) {
    await this.collectionService.deleteOne(collection, id);
  }
}
