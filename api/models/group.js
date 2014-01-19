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

  var Schema = mongoose.Schema({
      name: { type: String, required: true },
      users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
      //messages: [ MessageSchema ],
      domains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Domain' } ],
      created: { 
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      updated: { 
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      description: String,
  });

  return Schema;

}