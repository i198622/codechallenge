import fs from 'fs';

export function Log(str: string) {
  fs.writeFileSync(process.cwd() + '/dump.txt', str);
}