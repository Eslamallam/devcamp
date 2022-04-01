const NodeGeocoder = require("node-geocoder");

const options = {
  provider: process.env.GOECODER_PROVIDER,

  // Optional depending on the providers
  apiKey: process.env.GOECODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
