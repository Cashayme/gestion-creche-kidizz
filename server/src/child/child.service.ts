import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './child.entity';
import { ChildDaycare } from './child-daycare.entity';
import { User } from '../user/user.entity';
import { Daycare } from '../daycare/daycare.entity';

@Injectable()
export class ChildService {
  constructor(
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(ChildDaycare)
    private childDaycareRepository: Repository<ChildDaycare>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Daycare)
    private daycareRepository: Repository<Daycare>,
  ) {}

  async getChildrenInDaycare(daycareId: number): Promise<object> {
    return this.childDaycareRepository.find({
      where: { daycare: { id: daycareId } },
      relations: ['child'],
    });
  }

  async createChild(
    createChildDto: {
      first_name: string;
      last_name: string;
      daycare_id: number;
    },
    username: string,
  ): Promise<object> {
    const { first_name, last_name, daycare_id } = createChildDto;

    if (!first_name || !last_name || !daycare_id) {
      throw new BadRequestException(
        "Le prénom, le nom de l'enfant et l'ID de la crèche sont requis",
      );
    }

    const creator = await this.userRepository.findOne({ where: { username } });
    if (!creator) {
      throw new NotFoundException(
        `Utilisateur avec le nom ${username} non trouvé`,
      );
    }

    const daycare = await this.daycareRepository.findOne({
      where: { id: daycare_id },
    });
    if (!daycare) {
      throw new NotFoundException(`Crèche avec l'ID ${daycare_id} non trouvée`);
    }

    const child = this.childRepository.create({
      first_name,
      last_name,
      creator,
    });

    const savedChild = await this.childRepository.save(child);

    const childDaycare = this.childDaycareRepository.create({
      child: savedChild,
      daycare,
    });

    await this.childDaycareRepository.save(childDaycare);

    return { ...savedChild, daycare: { id: daycare.id, name: daycare.name } };
  }

  async canDeleteAssignment(
    childId: number,
    username: string,
  ): Promise<boolean> {
    const child = await this.childRepository.findOne({
      where: { id: childId },
      relations: ['creator'],
    });

    if (!child) {
      throw new NotFoundException(`Enfant avec l'ID ${childId} non trouvé`);
    }

    return child.creator.username === username;
  }

  async removeChildFromDaycare(
    daycareId: number,
    childId: number,
  ): Promise<object> {
    const assignment = await this.childDaycareRepository.findOne({
      where: { daycare: { id: daycareId }, child: { id: childId } },
    });

    if (!assignment) {
      throw new NotFoundException('Affectation non trouvée');
    }

    await this.childDaycareRepository.remove(assignment);

    // Vérifier si l'enfant a d'autres affectations
    const otherAssignments = await this.childDaycareRepository.find({
      where: { child: { id: childId } },
    });

    if (otherAssignments.length === 0) {
      // Si l'enfant n'a plus d'affectations, le supprimer
      const child = await this.childRepository.findOne({
        where: { id: childId },
      });
      if (child) {
        await this.childRepository.remove(child);
      }
    }

    return { message: 'Affectation supprimée avec succès' };
  }
}
