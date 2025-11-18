import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ItemsModule } from './items/items.module';
import { CommandRunnerModule } from 'nest-commander';

@Module({
  imports: [DatabaseModule, ItemsModule, CommandRunnerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
