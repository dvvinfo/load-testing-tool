import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from './items/items.module';
import { ItemsSeeder } from './items/items.seeder';
import { SeedCommand } from './items/commands/seed.command';
import { CommandRunnerModule } from 'nest-commander';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db', // This will be the service name in docker-compose
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'testdb',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ItemsModule,
    CommandRunnerModule,
  ],
  controllers: [AppController],
  providers: [AppService, ItemsSeeder, SeedCommand],
})
export class AppModule {}