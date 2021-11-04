const path = require('path');
const { configPaths } = require('react-app-rewire-alias');
const { aliasDangerous } = require('react-app-rewire-alias/lib/aliasDangerous');

const aliasMap = configPaths('./tsconfig.paths.json'); // or jsconfig.paths.json

module.exports = aliasDangerous(aliasMap);
