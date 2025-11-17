import { CommandRunner, Command } from 'nest-commander';
import { ItemsSeeder } from '../items.seeder';

@Command({
  name: 'seed',
  description: 'Seed the database with items',
})
export class SeedCommand extends CommandRunner {
  constructor(private readonly itemsSeeder: ItemsSeeder) {
    super();
  }

  async run(): Promise<void> {
    await this.itemsSeeder.seed();
  }
}