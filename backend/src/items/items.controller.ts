import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ItemsService } from './items.service';
import { GetItemsDto } from './dto/get-items.dto';
import { ItemsResponseDto } from './dto/items-response.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: GetItemsDto,
  ): Promise<ItemsResponseDto> {
    const { limit = 10, offset = 0 } = query;
    const { data, total } = await this.itemsService.findAll(limit, offset);

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
