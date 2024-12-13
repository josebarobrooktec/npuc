#!/usr/bin/env node
/* eslint-disable no-console */
const chalk = require('chalk');

const { showHelp, showLicenses } = require('./src/lib/getParams');
const { allowedLicenses } = require('./src/lib/getConfig');
const { checkNodeVersion } = require('./src/lib/checkNode');
const { checkUpdates } = require('./src/lib/checkPackages');

const packageJson = require('./package.json');

const printUpdatablePackages = (updateblePackages, level) => {
  const chalkColor = {
    major: chalk.red,
    minor: chalk.yellow,
    patch: chalk.green,
  };
  if (updateblePackages[level].length) {
    console.log(chalkColor[level].bold(`${[level]} updates available:`));
    updateblePackages[level].forEach((pkg) => {
      console.log(chalkColor[level](`  ${pkg.packageName}: ${pkg.installedVersion} -> ${pkg.lastestVersion}`));
    });
    return true;
  }
  return false;
};

if (showLicenses) {
  console.log(allowedLicenses);
} else if (!showHelp) {
  console.log(chalk.dim(`Running check-updates version: ${packageJson.version}`));
  const {
    isValidNode, isSkipped, noNvmFileError, nvmrcVersion, nodeLTSVersion,
  } = checkNodeVersion();
  if (!isValidNode) {
    if (noNvmFileError) {
      console.error(chalk.red('.nvmrc file is missing'));
    } else {
      console.error(chalk.red(`Node version in .nvmrc is not the latest LTS version: ${nodeLTSVersion} current ${nvmrcVersion}`));
    }
    process.exit(1);
  } else if (isSkipped) {
    console.log(chalk.red.dim('Skipping node version check'));
  }
  checkUpdates().then((updateblePackages) => {
    const hasPatchUpdates = printUpdatablePackages(updateblePackages, 'patch');
    const hasMinorUpdates = printUpdatablePackages(updateblePackages, 'minor');
    const hasMajorUpdates = printUpdatablePackages(updateblePackages, 'major');
    if (!hasMajorUpdates && !hasMinorUpdates && !hasPatchUpdates) {
      console.log(chalk.green('No updates available'));
      process.exit(0);
    }
    console.log(chalk.dim('Run `npx npm-check-updates -u --target minor` or (patch, mayor) to update or add to skipPackages in .npucrc.json if is not posible'));
    process.exit(1);
  });
}
