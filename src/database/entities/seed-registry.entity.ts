import { BaseEntity } from '../../common/database/base.entity.js';
import { Column, Entity } from 'typeorm';

@Entity('seed_registry')
export class SeedRegistry extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  seed_name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  executed_at: Date;
}
