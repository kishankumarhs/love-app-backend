import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Feedback } from './entities/feedback.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Country } from './entities/countries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Feedback, Country])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
