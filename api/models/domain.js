/*
 * caminio-auth
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var _       = require('lodash');

module.exports = DomainModel;

/**
 *
 * @class Domain
 */ 
function DomainModel( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;

  var schema = new mongoose.Schema({
      name: { type: String, 
              required: true,
              lowercase: true,
              index: { unique: true },
              validate: [ DomainNameValidator, 'invalid domain name' ] },
      title: String, // could be used to say 'TASTENWERK e.U.'
      users: [ { type: ObjectId, ref: 'User' } ],
      groups: [ { type: ObjectId, ref: 'Group' } ],
      owner: { type: ObjectId, ref: 'User' },
      plan: { type: String, default: 'default' },
      planPrice: Number,
      preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
      allowedAppNames: { type: Array, default: ['admin'] },
      //messages: [ MessageSchema ],
      created: { 
        at: { type: Date, default: Date.now },
        by: { type: ObjectId, ref: 'User' }
      },
      updated: { 
        at: { type: Date, default: Date.now },
        by: { type: ObjectId, ref: 'User' }
      },
      locked: {
        at: { type: Date },
        by: { type: ObjectId, ref: 'User' }
      },
      description: String,
  });

  schema.method( 'lock', lock );
  schema.method( 'addUser', addUser );
  schema.method( 'allowedApps', allowedApps );
  
  schema.publicAttributes = [
    'name',
    'title',
    'users',
    'owner',
    'plan',
    'planPrice',
    'preferences',
    'locked',
    'created',
    'updated',
    'description'
  ];

  // do population on autorest show
  schema.static('populateOnShow', [
    'owner',
    'created.by'
  ]);

  return schema;

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
    user.camDomains.push( this );
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

  /**
   * returns list of allowed applications for this
   * user
   *
   * The method reads the currentDoman object and returns an
   * array containing the names of the applications (not gears)
   * this domain (and their users) can access
   *
   * @param {Domain} domain the domain to be parsed for applications
   *
   */
  function allowedApps(){
    var self = this;
    
    if( this._allowedArr ) return this._allowedArr;

    var available = {};
    _.each( caminio.gears, function( gear ){
      _.each( gear.applications, function( appDef ){
        var buildAppDef = { name: appDef.name };
        buildAppDef.icon = appDef.icon || 'fa-'+buildAppDef.name.toLowerCase();
        buildAppDef.path = appDef.path || '/caminio/'+appDef.name;
        buildAppDef.admin = appDef.admin || false;
        buildAppDef.su = appDef.su || false;
        available[appDef.name] = buildAppDef;
      });
    });

    this._allowedArr = [];
    _.each( this.allowedAppNames, function( appName ){
      if( appName in available )
        self._allowedArr.push( available[appName] );
    });

    return this._allowedArr;
  }

}
