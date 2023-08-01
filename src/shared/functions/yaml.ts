import * as yaml from 'yaml';
import * as fse from 'fs-extra';

export async function loadPermissionsFromYaml(path: string) {
  if ((await fse.pathExists(path)) === false) {
    throw new Error(`Permissions file not found at ${path}`);
  }

  return yaml.parse(path);
}
