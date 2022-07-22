const fs = require('fs');
const path = require('path');
// replace IS_ELECTRON  to yes, beacause axios relative url
const envConfig = path.join(__dirname, './build/env-config.js');
fs.readFile(envConfig, 'utf8', function (err, files) {
  const result = files.replace(/{{IS_ELECTRON}}/g, 'yes');
  fs.writeFile(envConfig, result, 'utf8', function (err) {
    if (err) {
      console.log(err);
    }
  });
});
