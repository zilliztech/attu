const path = require('path');
// const darkTheme = require("@ant-design/dark-theme").default;

module.exports = {
  // The paths config to use when compiling your react app
  //  for development or production.
  paths: function (paths, env) {
    // ...add your paths config
    paths.appBuild = path.resolve(__dirname, '../server/build');
    return paths;
  },
};
