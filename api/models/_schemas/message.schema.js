/*
 * camin.io
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

module.exports = function MessageSchema( caminio, mongoose ){

  /**
   * @class MessageSchema
   *
   * a message is for inner communication
   * between users
   */
  var Schema = new mongoose.Schema({
    content: String,
    read: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  });

  /**
   * a message can have followups
   */
  Schema.add({
    followUps: [ MessageSchema ]
  });

  return Schema;

}

