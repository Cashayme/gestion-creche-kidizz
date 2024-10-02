import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ChildDaycare } from '../child/child-daycare.entity';

@Entity()
export class Daycare {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'creator_id' })
  creator_id!: number;

  @ManyToOne(() => User, (user) => user.daycares)
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @OneToMany(() => ChildDaycare, (childDaycare) => childDaycare.daycare)
  children!: ChildDaycare[];
}
