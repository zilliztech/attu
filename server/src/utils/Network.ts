import os from 'os';

export const getIp = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    if (interfaces.hasOwnProperty(k)) {
      for (const k2 in interfaces[k]) {
        if (interfaces[k].hasOwnProperty(k2)) {
          const address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
          }
        }
      }
    }
  }

  return addresses;
};
