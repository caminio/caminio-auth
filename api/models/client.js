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
 * The user class is the main user object
 * for any operations in caminio
 *
 * @class User
 * @constructor
 *
 */

module.exports = function ClientModel( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;

  var schema = new mongoose.Schema({
    secret: {
      type: String,
      required: true
    },
    user: {
      type: ObjectId,
      required: true,
      ref: 'User'
    },
    expires: {
      at: {
        type: Date
      }
    },
    scope: { type: String, default: '*' }
  });

  schema.path('secret').default( function(){ return util.uid(8); } );
  schema.path('expires.at').default( function(){ return new Date() + 1000 * 3600 * 24 * 31 * 3; } );

  return schema;

}