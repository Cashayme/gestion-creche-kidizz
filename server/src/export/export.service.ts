import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from '../child/child.entity';
import { Response } from 'express';
import * as csv from 'fast-csv';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
  ) {}

  async streamChildrenCsv(res: Response, childCareId?: number): Promise<void> {
    const queryBuilder = this.childRepository
      .createQueryBuilder('child')
      .leftJoin(
        'child_daycare',
        'childDaycare',
        'childDaycare.child_id = child.id',
      )
      .leftJoin('daycare', 'daycare', 'childDaycare.daycare_id = daycare.id')
      .orderBy('child.last_name', 'ASC')
      .select([
        'child.id as child_id',
        'child.first_name as child_first_name',
        'child.last_name as child_last_name',
        'daycare.id as daycare_id',
        'daycare.name as daycare_name',
      ])
      .distinct();

    if (childCareId) {
      queryBuilder.where('daycare.id = :childCareId', { childCareId });
    }

    const children = await queryBuilder.getRawMany();
    res.write('\ufeff');

    const csvStream = csv.format({ headers: true, delimiter: ';' });

    csvStream.pipe(res);

    for (const child of children) {
      const daycareNames = child.daycare_name ? child.daycare_name : 'N/A';

      csvStream.write({
        ID: child.child_id,
        Prénom: child.child_first_name,
        Nom: child.child_last_name,
        Crèches: daycareNames,
      });
    }

    csvStream.end();

    return new Promise<void>((resolve) => {
      csvStream.on('end', () => {
        res.end();
        resolve();
      });
    });
  }
}
