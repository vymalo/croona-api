import { BadRequestException } from '@nestjs/common';

export function opFromMethod(method: string) {
  switch (method) {
    case 'OPTIONS':
    case 'GET':
      return 'read';
    case 'POST':
    case 'PUT':
      return 'write';
    case 'DELETE':
      return 'delete';
    default:
      throw new BadRequestException(`Method ${method} not supported`);
  }
}
