import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ChildDaycare } from './child-daycare.entity';

@Entity()
export class Child {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ name: 'creator_id' })
  creator_id!: number;

  @ManyToOne(() => User, (user) => user.children)
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @OneToMany(() => ChildDaycare, (childDaycare) => childDaycare.child)
  daycares!: ChildDaycare[];
}
