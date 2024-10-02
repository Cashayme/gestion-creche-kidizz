import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { Daycare } from '../daycare/daycare.entity';

@Entity('child_daycare')
export class ChildDaycare {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'child_id' })
  childId!: number;

  @ManyToOne(() => Child, (child) => child.daycares)
  @JoinColumn({ name: 'child_id' })
  child!: Child;

  @Column({ name: 'daycare_id' })
  daycareId!: number;

  @ManyToOne(() => Daycare, (daycare) => daycare.children)
  @JoinColumn({ name: 'daycare_id' })
  daycare!: Daycare;
}
