import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { Provider } from './entities/provider.entity';
import { Employee } from './entities/employee.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

import { Review } from '../review/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, Employee, User, Review]),
    forwardRef(() => UserModule),
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule { }
