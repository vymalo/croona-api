import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CollectionService } from './collection/collection.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

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

  @ApiOperation({ summary: 'Get an item', operationId: 'getOne' })
  @Get(':id')
  public get(@Param('collection') collection: string, @Param('id') id: string) {
    return this.collectionService.get(collection, id);
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
