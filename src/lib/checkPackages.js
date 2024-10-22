const ncu = require('npm-check-updates');
const semver = require('semver');

const { packageJsonPath, skipPackages } = require('./getConfig');

const checkUpdates = async () => {
  const groupedPackages = { patch: [], minor: [], major: [] };
  const installedPackages = {};
  const updateblePackages = await ncu.run({
    packageFile: packageJsonPath,
    upgrade: false,
    reject: skipPackages,
    format: ['ownerChanged'],
    filter: (packgeName, [versionData]) => {
      installedPackages[packgeName] = versionData.semver;
      return true;
    },
  });
  // compare updateblePackages versions with installedPackages versions
  Object.keys(updateblePackages).forEach((packageName) => {
    const lastestSemVer = semver.coerce(updateblePackages[packageName]);
    const installedSemVer = semver.coerce(installedPackages[packageName]);
    const packageInfo = {
      packageName,
      lastestVersion: lastestSemVer.raw,
      installedVersion: installedSemVer.raw,
    };
    if (semver.major(lastestSemVer) > semver.major(installedSemVer)) {
      groupedPackages.major.push(packageInfo);
    } else if (semver.minor(lastestSemVer) > semver.minor(installedSemVer)) {
      groupedPackages.minor.push(packageInfo);
    } else if (semver.patch(lastestSemVer) > semver.patch(installedSemVer)) {
      groupedPackages.patch.push(packageInfo);
    }
  });

  return groupedPackages;
};

module.exports = {
  checkUpdates,
};
