const axios = require('axios');

const BASE_URL = process.env.INSIGHT_URL;
console.log('---- check start ----- ', BASE_URL);

axios
  .get(`${BASE_URL}/api/v1/collections`)
  .then(res => {
    console.log(res.data);
    if (res.data.statusCode === 200) {
      console.log('---- Server OK -----');
    } else {
      throw new Error('');
    }
  })
  .then(err => {
    throw new Error(err.message || '---- Server has some error ----');
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
    throw new Error(err.message || '---- Client has some error ----');
  });
