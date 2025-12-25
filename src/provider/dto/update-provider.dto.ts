import { PartialType } from '@nestjs/mapped-types';
import { CreateProvider } from './create-provider.dto';

export class UpdateProviderDto extends PartialType(CreateProvider) {}
