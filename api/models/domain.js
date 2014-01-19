/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

/**
 *
 * @class Domain
 */
 
module.exports = function GroupModel( caminio, mongoose ){

  var Schema = new mongoose.Schema({
      name: { type: String, 
              required: true,
              lowercase: true,
              required: true,
              index: { unique: true },
              validate: [ DomainNameValidator, 'invalid domain name' ] },
      users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
      groups: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Group' } ],
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      plan: { type: String, default: 'default' },
      preferences: { type: mongoose.Schema.Types.Mixed },
      allowed_gears: { type: Array, default: ['caminio-dashboard'] },
      //messages: [ MessageSchema ],
      created: { 
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      updated: { 
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      locked: {
        at: { type: Date },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      description: String,
  });

  Schema.method( 'lock', lock );
  Schema.method( 'addUser', addUser );
  return Schema;

}

/**
 * validates, if domain name has at least
 * one dot and consists of at least 2 chars LHS and RHS
 *
 * @method DomainNameValidator
 * @private
 *
 */
function DomainNameValidator( val ){
  if( !val ) return false;
  return val.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[\.]{0,1}[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/);
}
/**
 *
 * Adds a user to this domain. The user has to be saved seperately
 *
 * @method addUser
 * @param {User} user the user to be added
 * @param {User} manager a user with owner status (only domain managers can add users)
 * @param {Function} callback
 * @param {Object} err The error object, if anything goes wrong saving the domain
 */
function addUser( user, manager, callback ){
  if( manager && manager.id !== this.owner )
    throw 'insufficient rights';
  user.domains.push( this );
  this.users.push( user );
  this.save( callback );
}

/**
 * locks a domain. This affects any user associated with this domain.
 * Sets. locked.at, locked.by
 * @method lock
 * @param {User} user The user object which locks the domain (must be admin)
**/
function lock( user ){
  if( !user.isAdmin(this) )
    throw 'insufficient rights';
  this.locked.at = new Date();
  this.locked.by = user;
}