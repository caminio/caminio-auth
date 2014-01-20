/*
 * camin.io
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

/**
 * Groups users
 *
 * @class Group
 */
 
module.exports = function GroupModel( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;

  var schema = mongoose.Schema({
      name: { type: String, required: true },
      users: [ { type: ObjectId, ref: 'User' } ],
      //messages: [ MessageSchema ],
      domains: [{ type: ObjectId, ref: 'Domain' } ],
      created: { 
        at: { type: Date, default: Date.now },
        by: { type: ObjectId, ref: 'User' }
      },
      updated: { 
        at: { type: Date, default: Date.now },
        by: { type: ObjectId, ref: 'User' }
      },
      description: String,
  });

  return schema;

}