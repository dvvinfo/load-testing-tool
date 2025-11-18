import { createConnection } from 'typeorm';
import { Item } from './items/entities/item.entity';

async function seed() {
  console.log('Connecting to database...');

  // Create connection
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'db',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'testdb',
    entities: [Item],
    synchronize: true,
    logging: false,
  });

  console.log('Connected to database');

  const itemRepository = connection.getRepository(Item);

  // Check current count
  const count = await itemRepository.count();
  console.log(`Current item count: ${count}`);

  // Determine desired total from env or default to 50000
  const totalItems = parseInt(process.env.SEED_TOTAL || '50000', 10);
  if (count >= totalItems) {
    console.log('Database already seeded with sufficient items.');
    await connection.close();
    console.log('Database connection closed');
    return;
  }

  console.log('Seeding items...');

  // Create items in batches
  const batchSize = parseInt(process.env.SEED_BATCH_SIZE || '1000', 10);
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
    console.log(
      `Seeded ${Math.min(count + i + batchSizeActual, totalItems)} / ${totalItems} items`,
    );
  }

  console.log('Seeding completed!');

  // Close connection
  await connection.close();
  console.log('Database connection closed');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
