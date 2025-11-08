import { SetMetadata } from '@nestjs/common';

export const AllowGuest = () => SetMetadata('allowGuest', true);