import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { Child } from '../child/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child])],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
