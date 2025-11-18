import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'db',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'testdb',
      autoLoadEntities: true,
      synchronize: true,
      extra: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000,
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
