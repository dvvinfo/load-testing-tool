import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsSeeder {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async seed() {
    const count = await this.itemsRepository.count();
    
    // Only seed if there are fewer than 50,000 items
    if (count < 50000) {
      console.log('Seeding items...');
      
      // Create items in batches to avoid memory issues
      const batchSize = 1000;
      const totalItems = 50000;
      const remainingItems = totalItems - count;
      
      for (let i = 0; i < remainingItems; i += batchSize) {
        const batch = [];
        const batchSizeActual = Math.min(batchSize, remainingItems - i);
        
        for (let j = 0; j < batchSizeActual; j++) {
          const item = new Item();
          item.name = `Item ${count + i + j + 1}`;
          batch.push(item);
        }
        
        await this.itemsRepository.save(batch);
        console.log(`Seeded ${Math.min(count + i + batchSizeActual, totalItems)} / ${totalItems} items`);
      }
      
      console.log('Seeding completed!');
    } else {
      console.log('Database already seeded with sufficient items.');
    }
  }
}