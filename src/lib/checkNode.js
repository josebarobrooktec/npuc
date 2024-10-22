const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { cwd } = require('./getParams');
const { checkNodeversion: mustCheckNodeVersion } = require('./getConfig');

const nvmrcPath = path.join(cwd(), '.nvmrc');

function getLastNodeLTS() {
  const nodeDistUrl = 'https://nodejs.org/dist/index.json';
  const nodeDist = JSON.parse(execSync(`curl -s ${nodeDistUrl}`).toString());
  const ltsVersions = nodeDist.find((version) => version.lts);
  return ltsVersions.version;
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

  const nodeLTSVersion = getLastNodeLTS();

  return {
    nvmrcVersion,
    nodeLTSVersion,
    isValidNode: nvmrcVersion === nodeLTSVersion,
  };
}

module.exports = {
  checkNodeVersion,
};
