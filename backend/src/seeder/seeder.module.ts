import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { ItemsModule } from '../items/items.module';
import { ItemsSeeder } from '../items/items.seeder';
import { SeedCommand } from '../items/commands/seed.command';

@Module({
  imports: [
    ItemsModule,
    CommandRunnerModule,
  ],
  providers: [ItemsSeeder, SeedCommand],
})
export class SeederModule {}