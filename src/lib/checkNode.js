const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { cwd } = require('./getParams');
const { checkNodeversion: mustCheckNodeVersion } = require('./getConfig');

const nvmrcPath = path.join(cwd(), '.nvmrc');

let nodeVersions = [];

function getNodeVersions() {
  const nodeDistUrl = 'https://nodejs.org/dist/index.json';
  return JSON.parse(execSync(`curl -s ${nodeDistUrl}`).toString());
}

function setNodeVersions() {
  nodeVersions = getNodeVersions();
}

function getLastNodeLTS() {
  const ltsVersions = nodeVersions.find((version) => version.lts);
  return {
    version: ltsVersions.version,
    name: ltsVersions.lts,
  };
}

function versionToArray(version) {
  const parsedVersion = version.replace(/[^0-9.*]/g, '');
  return parsedVersion.split('.').map((n) => (n === '*' ? Infinity : parseInt(n, 10)));
}

function compareVersions(ltsVersionObj, version) {
  // if version is a name like 'lts/*' compare names
  if (version.includes('lts/')) {
    // compatibility with older versions of node
    // eslint-disable-next-line prefer-template
    return 'lts/' + (ltsVersionObj.name.toLowerCase()) === version.toLowerCase() ? 0 : -1;
  }

  const ltsVersionArray = versionToArray(ltsVersionObj.version);
  const versionArray = versionToArray(version);

  const minLength = Math.min(ltsVersionArray.length, versionArray.length);
  for (let i = 0; i < minLength; i += 1) {
    if (ltsVersionArray[i] > versionArray[i]) {
      return -1;
    }
    if (ltsVersionArray[i] < versionArray[i]) {
      return 1;
    }
  }
  return 0;
}

function checkNodeVersion() {
  if (!mustCheckNodeVersion) {
    return {
      isValidNode: true,
      isSkipped: true,
    };
  }
  if (!fs.existsSync(nvmrcPath)) {
    return {
      isValidNode: false,
      noNvmFileError: true,
    };
  }

  const nvmrcVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();

  setNodeVersions();
  const nodeLTSVersionObj = getLastNodeLTS();

  return {
    nvmrcVersion,
    nodeLTSVersion: nodeLTSVersionObj.version,
    isValidNode: compareVersions(nodeLTSVersionObj, nvmrcVersion) >= 0,
  };
}

module.exports = {
  checkNodeVersion,
};
