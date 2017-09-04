const os = require('os')
const path = require('path')

module.exports = {

  /**
   * Core-Node config
   */
  endpointPath: path.join(__dirname, '/../endpoints/'),
  endpointParent: path.join(__dirname, '/../lib/endpoint.js'),

  /**
   * Target Node URLs
   */
  apiURL: 'http://localhost:3010',
  authURL: 'http://localhost:3030',

  limit: {
    disable: false,
    interval: 60000,
    maxInInterval: 180
  },

  /**
   * Databases
   */
  mongoPort: 27017,
  mongoURL: 'mongodb://localhost/blitz-js-core',
  redisPort: 6379,

  /**
   * Cluster config
   */
  cores: os.cpus().length
}
