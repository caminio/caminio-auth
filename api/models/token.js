/*
 * camin.io
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var util = require('caminio/util');

/**
 * The token class for oauth
 *
 * @class Token
 * @constructor
 *
 */
module.exports = function TokenModel( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;

  var schema = new mongoose.Schema({
    secret: {
      type: String,
      required: true
    },
    client: {
      type: ObjectId,
      required: true,
      ref: 'Client'
    },
    expires: {
      at: {
        type: Date
      }
    },
    created: { 
      at: { type: Date, default: Date.now }
    },
    token: String,
    ipAddress: String
  });

  schema.path('secret').default( function(){ return util.uid(8); } );
  schema.path('token').default( function(){ return util.uid(64); } );
  schema.path('expires.at').default( function(){ return new Date() + caminio.config.token.timeout; } );

  schema.publicAttributes = ['secret','client','expires','token'];
  return schema;

}