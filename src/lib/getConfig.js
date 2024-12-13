const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const { cwd, isInit } = require('./getParams');

const rcFileName = '.npucrc.json';

// rc filename is a constant
// eslint-disable-next-line import/no-dynamic-require
const sampleRcFile = require(`../../${rcFileName}`);

const rcPath = path.join(cwd(), rcFileName);
const packageJsonPath = path.join(cwd(), 'package.json');

let rc = {};

if (fs.existsSync(rcPath)) {
  rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
} else if (isInit) {
  console.log(chalk.dim(`Creating rc file:${rcPath}`));
  fs.writeFileSync(rcPath, JSON.stringify(sampleRcFile, null, 2));
} else {
  console.log(chalk.dim('No rc file found. Run with --init to create one'));
}

const checkNodeversion = rc.checkNodeversion === undefined ? true : rc.checkNodeversion;
const skipPackages = rc.skipPackages || [];

module.exports = {
  packageJsonPath,
  checkNodeversion,
  skipPackages,
  rc,
};
