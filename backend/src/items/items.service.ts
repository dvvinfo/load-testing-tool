import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async findAll(limit: number = 10, offset: number = 0): Promise<{ data: Item[]; total: number }> {
    const [data, total] = await this.itemsRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'ASC',
      },
    });

    return { data, total };
  }

  async count(): Promise<number> {
    return this.itemsRepository.count();
  }
}