import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChildService } from './child.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Enfants')
@Controller()
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Get('child-care/:id/children')
  @ApiOperation({ summary: 'Obtenir la liste des enfants dans une garderie' })
  @ApiParam({ name: 'id', description: 'ID de la garderie' })
  @ApiResponse({
    status: 200,
    description: 'Liste des enfants dans la garderie',
  })
  getChildrenInDaycare(@Param('id') daycareId: string): Promise<object> {
    return this.childService.getChildrenInDaycare(+daycareId);
  }

  @Post('child')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Créer un nouvel enfant et l'associer à une crèche",
  })
  @ApiHeader({
    name: 'X-Auth',
    description: "Nom d'utilisateur pour l'authentification",
    required: true,
  })
  @ApiBody({
    description: "Données pour la création d'un enfant",
    schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'string',
          description: "Prénom de l'enfant",
        },
        last_name: {
          type: 'string',
          description: "Nom de famille de l'enfant",
        },
        daycare_id: {
          type: 'number',
          description: "ID de la crèche à laquelle l'enfant sera associé",
        },
      },
      required: ['first_name', 'last_name', 'daycare_id'],
    },
  })
  @ApiResponse({
    status: 201,
    description: "L'enfant a été créé et associé à la crèche avec succès",
  })
  @ApiResponse({
    status: 400,
    description: 'Requête incorrecte - Données manquantes ou invalides',
  })
  createChild(
    @Body()
    createChildDto: {
      first_name: string;
      last_name: string;
      daycare_id: number;
    },
    @Headers('X-Auth') username: string,
  ): Promise<object> {
    if (
      !createChildDto.first_name ||
      !createChildDto.last_name ||
      !createChildDto.daycare_id
    ) {
      throw new BadRequestException(
        "Le prénom, le nom de l'enfant et l'ID de la crèche sont requis",
      );
    }
    return this.childService.createChild(createChildDto, username);
  }

  @Delete('child-care/:daycareId/child/:childId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retirer un enfant d'une garderie" })
  @ApiParam({ name: 'daycareId', description: 'ID de la garderie' })
  @ApiParam({ name: 'childId', description: "ID de l'enfant" })
  @ApiHeader({
    name: 'X-Auth',
    description: "Nom d'utilisateur pour l'authentification",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Enfant retiré avec succès de la garderie',
  })
  @ApiResponse({
    status: 401,
    description:
      "Non autorisé - L'utilisateur ne peut pas supprimer cette affectation",
  })
  async removeChildFromDaycare(
    @Param('daycareId') daycareId: string,
    @Param('childId') childId: string,
    @Headers('X-Auth') username: string,
  ): Promise<object> {
    const canDelete = await this.childService.canDeleteAssignment(
      +childId,
      username,
    );
    if (!canDelete) {
      throw new UnauthorizedException(
        "Vous n'avez pas le droit de supprimer cette affectation",
      );
    }
    return this.childService.removeChildFromDaycare(+daycareId, +childId);
  }
}
