import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}