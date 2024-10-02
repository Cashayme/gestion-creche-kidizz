import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  UnauthorizedException,
  UseGuards,
  Inject,
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
import { ChildCareService } from './child-care.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Crèches')
@Controller()
export class ChildCareController {
  @Inject(ChildCareService)
  private readonly childCareService!: ChildCareService;

  @Get('child-cares')
  @ApiOperation({ summary: 'Obtenir la liste de toutes les crèches' })
  @ApiResponse({
    status: 200,
    description: 'Liste des crèches récupérée avec succès',
  })
  findAll(): Promise<object> {
    return this.childCareService.findAll();
  }

  @Post('child-care')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle crèche' })
  @ApiHeader({
    name: 'X-Auth',
    description: "Nom d'utilisateur pour l'authentification",
    required: true,
  })
  @ApiBody({
    description: "Données pour la création d'une crèche",
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nom de la crèche',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'La crèche a été créée avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  create(
    @Body('name') name: string,
    @Headers('X-Auth') username: string,
  ): Promise<object> {
    return this.childCareService.create(name, username);
  }

  @Delete('child-care/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une crèche' })
  @ApiParam({ name: 'id', description: 'ID de la crèche à supprimer' })
  @ApiHeader({
    name: 'X-Auth',
    description: "Nom d'utilisateur pour l'authentification",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'La crèche a été supprimée avec succès',
  })
  @ApiResponse({
    status: 401,
    description:
      "Non autorisé - L'utilisateur ne peut pas supprimer cette crèche",
  })
  async remove(
    @Param('id') id: string,
    @Headers('X-Auth') username: string,
  ): Promise<object> {
    const canDelete = await this.childCareService.canDelete(+id, username);
    if (!canDelete) {
      throw new UnauthorizedException(
        "Vous n'avez pas le droit de supprimer cette crèche",
      );
    }
    return this.childCareService.remove(+id, username);
  }
}
