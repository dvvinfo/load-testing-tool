import { createConnection } from 'typeorm';
import { Item } from './items/entities/item.entity';

async function seed() {
  console.log('Connecting to database...');
  
  // Create connection
  const connection = await createConnection({
    type: 'postgres',
    host: 'db',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'testdb',
    entities: [Item],
    synchronize: true,
    logging: false,
  });

  console.log('Connected to database');
  
  const itemRepository = connection.getRepository(Item);
  
  // Check current count
  const count = await itemRepository.count();
  console.log(`Current item count: ${count}`);
  
  // Only seed if there are fewer than 1000 items (for testing)
  if (count < 1000) {
    console.log('Seeding items...');
    
    // Create items in batches
    const batchSize = 100;
    const totalItems = 1000;
    const remainingItems = totalItems - count;
    
    for (let i = 0; i < remainingItems; i += batchSize) {
      const batch: Item[] = [];
      const batchSizeActual = Math.min(batchSize, remainingItems - i);
      
      for (let j = 0; j < batchSizeActual; j++) {
        const item = new Item();
        item.name = `Item ${count + i + j + 1}`;
        batch.push(item);
      }
      
      await itemRepository.save(batch);
      console.log(`Seeded ${Math.min(count + i + batchSizeActual, totalItems)} / ${totalItems} items`);
    }
    
    console.log('Seeding completed!');
  } else {
    console.log('Database already seeded with sufficient items.');
  }
  
  // Close connection
  await connection.close();
  console.log('Database connection closed');
}

seed().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});