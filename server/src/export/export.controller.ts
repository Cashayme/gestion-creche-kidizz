import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Export')
@Controller('children')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('export.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=children_export.csv')
  @ApiOperation({ summary: 'Exporter les données des enfants en CSV' })
  @ApiQuery({ name: 'childCareId', required: false, type: Number })
  async exportChildrenCsv(
    @Query('childCareId') childCareId: number | undefined,
    @Res() res: Response,
  ): Promise<void> {
    await this.exportService.streamChildrenCsv(res, childCareId);
  }
}
