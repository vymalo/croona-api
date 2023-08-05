import { IsArray, IsObject, IsString } from 'class-validator';

export class PermissionsSchema {
  @IsArray()
  public rules: AppRuleSchema[];
}

export class AppRuleSchema {
  @IsString()
  public path: string;

  @IsObject()
  public conditions: Record<'read' | 'write' | 'delete', string>;
}
