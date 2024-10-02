import {
  Controller,
  Get,
  Put,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './user.entity';

@ApiTags('Utilisateurs')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: "Rechercher un utilisateur par nom d'utilisateur" })
  @ApiQuery({
    name: 'username',
    required: true,
    description: "Nom d'utilisateur à rechercher",
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé avec succès',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: "Le paramètre nom d'utilisateur est requis",
  })
  async findOne(@Query('username') username: string): Promise<User> {
    if (!username) {
      throw new BadRequestException(
        "Le paramètre nom d'utilisateur est requis",
      );
    }
    return this.userService.findByUsername(username);
  }

  @Put()
  @ApiOperation({ summary: 'Créer ou mettre à jour un utilisateur' })
  @ApiBody({
    description: "Données de l'utilisateur",
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: "Adresse email de l'utilisateur",
        },
        username: {
          type: 'string',
          description: "Nom d'utilisateur",
        },
      },
      required: ['email', 'username'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur créé ou mis à jour avec succès',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: "L'email et le nom d'utilisateur sont requis",
  })
  async createOrUpdate(
    @Body() userData: { email: string; username: string },
  ): Promise<User> {
    if (!userData.email || !userData.username) {
      throw new BadRequestException(
        "L'email et le nom d'utilisateur sont requis",
      );
    }
    return this.userService.createOrUpdate(userData);
  }
}
