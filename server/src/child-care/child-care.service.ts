import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Daycare } from './child-care.entity';
import { User } from '../user/user.entity';
import { ChildDaycare } from '../child/child-daycare.entity';

@Injectable()
export class ChildCareService {
  constructor(
    @InjectRepository(Daycare)
    private childCareRepository: Repository<Daycare>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ChildDaycare)
    private childDaycareRepository: Repository<ChildDaycare>,
  ) {}

  findAll(): Promise<Daycare[]> {
    return this.childCareRepository.find();
  }

  async create(name: string, username: string): Promise<Daycare> {
    const creator = await this.userRepository.findOne({ where: { username } });
    if (!creator) {
      throw new NotFoundException(
        `Utilisateur avec le nom ${username} non trouvé`,
      );
    }

    const childCare = this.childCareRepository.create({
      name,
      creator,
    });

    return this.childCareRepository.save(childCare);
  }

  async canDelete(id: number, username: string): Promise<boolean> {
    const childCare = await this.childCareRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!childCare) {
      throw new NotFoundException(`Crèche avec l'ID ${id} non trouvée`);
    }

    return childCare.creator.username === username;
  }

  async remove(id: number, initiatorUsername: string): Promise<object> {
    const childCare = await this.childCareRepository.findOne({
      where: { id },
      relations: ['children', 'children.child', 'children.child.creator'],
    });
    if (!childCare) {
      throw new NotFoundException(`Crèche avec l'ID ${id} non trouvée`);
    }

    // Récupérer les utilisateurs à notifier
    const usersToNotify = childCare.children
      .map((childDaycare) => childDaycare.child.creator)
      .filter(
        (user, index, self) =>
          user.username !== initiatorUsername &&
          index === self.findIndex((t) => t.id === user.id),
      );

    // Supprimer d'abord toutes les références dans ChildDaycare
    await this.childDaycareRepository.delete({ daycare: { id: childCare.id } });

    // Ensuite, supprimer la crèche
    await this.childCareRepository.remove(childCare);

    // Envoyer les notifications par lots de 3
    await this.sendNotificationsInBatches(
      usersToNotify.map((user) => user.email),
    );

    return { message: 'Crèche supprimée avec succès' };
  }

  private async sendNotificationsInBatches(emails: string[]): Promise<void> {
    const batchSize = 3;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await Promise.all(
        batch.map((email) => this.informStructureDeletion(email)),
      );
    }
  }

  private async informStructureDeletion(userEmail: string): Promise<void> {
    const secondsToWait = Math.trunc(Math.random() * 7) + 1;
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log(userEmail, 'informed!');
        resolve();
      }, secondsToWait * 1000);
    });
  }
}
