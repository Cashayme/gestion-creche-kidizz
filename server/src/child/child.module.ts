import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { Child } from './child.entity';
import { ChildDaycare } from './child-daycare.entity';
import { User } from '../user/user.entity';
import { Daycare } from '../daycare/daycare.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child, ChildDaycare, User, Daycare])],
  controllers: [ChildController],
  providers: [ChildService],
})
export class ChildModule {}
