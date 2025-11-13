import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Feedback } from './entities/feedback.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Countries } from './entities/countires.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Feedback, Countries])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
