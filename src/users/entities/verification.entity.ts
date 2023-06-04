import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entities';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@Entity()
@ObjectType()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  generateCode() {
    this.code = uuidv4();
  }
}
