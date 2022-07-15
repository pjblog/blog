#!/usr/bin/env node
import { Command } from 'commander';
import { cyan, gray } from 'chalk';
import { mount, info } from '@pjblog/blog';

const cliPackage = require('../package.json');
const program = new Command();

program
  .name(cliPackage.name)
  .description(cliPackage.description)
  .option('-v, --version', 'Pjblog version')
  .version(
      versionFormatPrint('- Cli  version:', cliPackage.version) + '\n'
    + versionFormatPrint('- Blog version:', info.version) + '\n'
  );

program
    .command('start')
    .description('启动Pjblog服务')
    .action(mount)

program.parseAsync();

function versionFormatPrint(name: string, version: string) {
  return `${cyan(name)} ${gray('v' + version)}`
}