import { SetMetadata } from '@nestjs/common';

export const ACTION_KEY = 'action';

export const Action = (action: string) => SetMetadata(ACTION_KEY, action);
