import * as yaml from 'yaml';
import * as fse from 'fs-extra';
import {
  AppRuleSchema,
  PermissionsSchema,
} from '../../app-config/models/permissions.schema';
import { validateOrReject } from 'class-validator';

export async function loadPermissionsFromYaml(
  path: string,
): Promise<AppRuleSchema[]> {
  if (!(await fse.pathExists(path))) {
    throw new Error(`Permissions file not found at ${path}`);
  }

  const o = yaml.parse(fse.readFileSync(path, 'utf8'));
  const schema = new PermissionsSchema();
  schema.rules = o.rules.map((r: any) => {
    const rule = new AppRuleSchema();
    rule.path = r.path;
    rule.conditions = r.conditions;
    return rule;
  });

  await validateOrReject(schema);
  return schema.rules;
}

export async function savePermissionsIntoYaml(
  permissions: AppRuleSchema[],
  path: string,
) {
  const schema = new PermissionsSchema();
  schema.rules = permissions;
  const doc = yaml.stringify(schema);
  fse.writeFileSync(path, doc);
}
