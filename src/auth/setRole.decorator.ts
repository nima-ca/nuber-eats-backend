import { SetMetadata } from '@nestjs/common/decorators';
import { ROLE_METADATA_KEY } from 'src/common/common.constatns';
import { AllowedRoles } from 'src/common/common.type';

export const setRole = (roles: AllowedRoles[]) =>
  SetMetadata(ROLE_METADATA_KEY, roles);
