import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec le nom d'utilisateur ${username} non trouvé`,
      );
    }
    return user;
  }

  private isValidEmail(email: string): boolean {
    // Expression régulière simple pour la validation d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async createOrUpdate(userData: {
    email: string;
    username: string;
  }): Promise<User> {
    if (!this.isValidEmail(userData.email)) {
      throw new BadRequestException("L'adresse email fournie n'est pas valide");
    }
    let user = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (user) {
      // Mise à jour d'un utilisateur existant
      if (user.username !== userData.username) {
        // Vérifier si le nouveau username n'est pas déjà utilisé
        const existingUserWithUsername = await this.userRepository.findOne({
          where: { username: userData.username },
        });
        if (existingUserWithUsername) {
          throw new ConflictException("Ce nom d'utilisateur est déjà utilisé");
        }
      }
      user.username = userData.username;
    } else {
      // Création d'un nouvel utilisateur
      const existingUserWithUsername = await this.userRepository.findOne({
        where: { username: userData.username },
      });
      if (existingUserWithUsername) {
        throw new ConflictException("Ce nom d'utilisateur est déjà utilisé");
      }
      user = this.userRepository.create(userData);
    }

    return this.userRepository.save(user);
  }
}
