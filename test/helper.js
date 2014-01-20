/**
 * caminio test helper
 */

process.env['NODE_ENV'] = 'test';

var helper = {};

helper.fixtures = require('caminio-fixtures');
helper.fixtures.readFixtures();

helper.chai = require('chai');
helper.chai.Assertion.includeStack = true;

helper.initApp = function( test, done ){

  if( helper.caminio )
    return done();

  helper.caminio = require('caminio');
  var Gear = helper.Gear = require('caminio/gear');
  new Gear({ api: true, absolutePath: __dirname+'/support/app' });

  // require this gear
  require('../');

  helper.caminio.init({ 
    config: { 
      root: __dirname+'/support/app',
      log: {
        filename: process.cwd()+'/test.log'
      }
    }
  });

  helper.url = 'http://localhost:'+helper.caminio.config.port;

  helper.caminio.on('ready', done);

}

module.exports = helper;
