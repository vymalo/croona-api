import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CollectionService } from './collection/collection.service';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@nestjs/cache-manager';

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
  public async getOne(
    @Param('collection') collection: string,
    @Param('id') id: string,
  ) {
    const items = await this.collectionService.findItems(collection, [id]);
    return items[0];
  }

  @ApiQuery({
    name: 'ids',
    required: false,
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  @CacheKey('collection')
  @ApiOperation({ summary: 'Get items', operationId: 'getMultiple' })
  @Get()
  public async getItems(
    @Param('collection') collection: string,
    @Query('ids') ids: string[] | string,
  ) {
    return await this.collectionService.findItems(
      collection,
      Array.isArray(ids) ? ids : [ids],
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
