import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildCareController } from './child-care.controller';
import { ChildCareService } from './child-care.service';
import { Daycare } from './child-care.entity';
import { User } from '../user/user.entity';
import { ChildDaycare } from '../child/child-daycare.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Daycare, User, ChildDaycare])],
  controllers: [ChildCareController],
  providers: [ChildCareService],
  exports: [ChildCareService],
})
export class ChildCareModule {}
