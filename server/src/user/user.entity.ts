import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Daycare } from '../daycare/daycare.entity';
import { Child } from '../child/child.entity'; // Assurez-vous que ce chemin est correct

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  username!: string;

  @OneToMany(() => Child, (child) => child.creator)
  children!: Child[];

  @OneToMany(() => Daycare, (daycare) => daycare.creator)
  daycares!: Daycare[];
}
