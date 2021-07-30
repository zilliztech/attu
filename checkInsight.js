const axios = require('axios');

const BASE_URL = process.env.INSIGHT_URL;
console.log('---- check start ----- ', BASE_URL);

axios
  .get(`${BASE_URL}/api/v1/asd`)
  .then(res => {
    console.log(res.data);
    if (res.data.statusCode === 200) {
      console.log('---- Server OK -----');
    } else {
      throw new Error('');
    }
  })
  .then(err => {
    console.log('---- Server has some error ----');
    process.exit();
  });

axios
  .get(`${BASE_URL}/connect`)
  .then(res => {
    // if return statusCode mean it's failed. Otherwise it will return html
    if (res.data.includes('<html')) {
      console.log('---- Client OK -----');
    } else {
      throw new Error('---- Client has some error ----');
    }
  })
  .catch(err => {
    console.log('---- Client has some error ----');
    process.exit();
  });
