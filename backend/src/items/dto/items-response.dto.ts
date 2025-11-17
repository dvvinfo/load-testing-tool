import { Item } from '../entities/item.entity';

export class ItemsResponseDto {
  data: Item[];
  total: number;
  limit: number;
  offset: number;
}