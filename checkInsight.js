const axios = require('axios');

const BASE_URL = process.env.INSIGHT_URL;
console.log('---- check start ----- ', BASE_URL);

const check = async () => {
  const clientRes = await axios.get(`${BASE_URL}/connect`);
  const serverRes = await axios.get(`${BASE_URL}/api/v1/asd`);
  if (serverRes.data.statusCode === 200) {
    console.log('---- Server OK -----');
  } else {
    throw new Error('---- Server has some error ----');
  }

  if (clientRes.data.includes('<html')) {
    console.log('---- Client OK -----');
  } else {
    throw new Error('---- Client has some error ----');
  }
};

check();
